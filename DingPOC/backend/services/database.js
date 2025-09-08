const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.dbPath = path.resolve('../data/poc.db');
    this.db = null;
  }

  // 初始化数据库
  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ 数据库连接失败:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ SQLite数据库连接成功');
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  // 创建数据表
  async createTables() {
    return new Promise((resolve, reject) => {
      const createEmployeesTable = `
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userid TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          mobile TEXT,
          email TEXT,
          department INTEGER,
          department_name TEXT,
          title TEXT,
          hired_date TEXT,
          departed_date TEXT,
          status TEXT NOT NULL,
          active BOOLEAN,
          raw_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createSyncLogsTable = `
        CREATE TABLE IF NOT EXISTS sync_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sync_type TEXT NOT NULL,
          status TEXT NOT NULL,
          message TEXT,
          data_count INTEGER,
          error_details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.serialize(() => {
        this.db.run(createEmployeesTable, (err) => {
          if (err) {
            console.error('❌ 创建员工表失败:', err.message);
            reject(err);
            return;
          }
          console.log('✅ 员工表创建/验证成功');
        });

        this.db.run(createSyncLogsTable, (err) => {
          if (err) {
            console.error('❌ 创建同步日志表失败:', err.message);
            reject(err);
            return;
          }
          console.log('✅ 同步日志表创建/验证成功');
          resolve();
        });
      });
    });
  }

  // 保存员工数据
  async saveEmployees(employees) {
    return new Promise((resolve, reject) => {
      if (!employees || employees.length === 0) {
        resolve({ updated: 0, inserted: 0 });
        return;
      }

      const insertOrUpdateSQL = `
        INSERT OR REPLACE INTO employees (
          userid, name, mobile, email, department, department_name, 
          title, hired_date, departed_date, status, active, raw_data, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      let processedCount = 0;
      const totalCount = employees.length;

      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        employees.forEach((employee) => {
          this.db.run(insertOrUpdateSQL, [
            employee.userid,
            employee.name,
            employee.mobile || '',
            employee.email || '',
            employee.department || 0,
            employee.departmentName || '',
            employee.title || '',
            employee.hiredDate || '',
            employee.departedDate || '',
            employee.status,
            employee.active ? 1 : 0,
            JSON.stringify(employee.rawData || employee)
          ], (err) => {
            if (err) {
              console.error('❌ 保存员工数据失败:', err.message, employee);
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            processedCount++;
            
            if (processedCount === totalCount) {
              this.db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  console.error('❌ 事务提交失败:', commitErr.message);
                  reject(commitErr);
                  return;
                }
                
                console.log(`✅ 成功保存 ${processedCount} 条员工记录`);
                
                // 记录同步日志
                this.logSync('employee_save', 'success', `保存${processedCount}条员工记录`, processedCount);
                
                resolve({ 
                  inserted: processedCount, 
                  updated: 0, 
                  total: processedCount 
                });
              });
            }
          });
        });
      });
    });
  }

  // 获取所有员工数据
  async getEmployees(status = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM employees 
        ORDER BY created_at DESC, name ASC
      `;
      let params = [];

      if (status) {
        sql = `
          SELECT * FROM employees 
          WHERE status = ? 
          ORDER BY created_at DESC, name ASC
        `;
        params = [status];
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ 获取员工数据失败:', err.message);
          reject(err);
          return;
        }

        const employees = rows.map(row => ({
          id: row.id,
          userid: row.userid,
          name: row.name,
          mobile: row.mobile,
          email: row.email,
          department: row.department,
          departmentName: row.department_name,
          title: row.title,
          hiredDate: row.hired_date,
          departedDate: row.departed_date,
          status: row.status,
          active: row.active === 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        resolve(employees);
      });
    });
  }

  // 获取同步日志
  async getSyncLogs(limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM sync_logs 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          console.error('❌ 获取同步日志失败:', err.message);
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  // 记录同步日志
  async logSync(syncType, status, message, dataCount = 0, errorDetails = null) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO sync_logs (sync_type, status, message, data_count, error_details)
        VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [syncType, status, message, dataCount, errorDetails], (err) => {
        if (err) {
          console.error('❌ 记录同步日志失败:', err.message);
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  // 获取员工统计信息
  async getEmployeeStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          status,
          COUNT(*) as count
        FROM employees 
        GROUP BY status
      `;

      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('❌ 获取员工统计失败:', err.message);
          reject(err);
          return;
        }

        const stats = {
          total: 0,
          active: 0,
          pending: 0,
          departed: 0
        };

        rows.forEach(row => {
          stats.total += row.count;
          
          switch(row.status) {
            case '在职':
              stats.active = row.count;
              break;
            case '待入职':
              stats.pending = row.count;
              break;
            case '离职':
              stats.departed = row.count;
              break;
          }
        });

        resolve(stats);
      });
    });
  }

  // 清空员工数据
  async clearEmployees() {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM employees';
      
      this.db.run(sql, [], (err) => {
        if (err) {
          console.error('❌ 清空员工数据失败:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ 员工数据已清空');
        
        // 记录同步日志
        this.logSync('employee_clear', 'success', '清空所有员工数据', 0);
        
        resolve({ cleared: true });
      });
    });
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ 数据库关闭失败:', err.message);
        } else {
          console.log('✅ 数据库连接已关闭');
        }
      });
    }
  }
}

module.exports = new DatabaseService();
const axios = require('axios');

class DingTalkService {
  constructor() {
    this.oldBaseURL = process.env.DINGTALK_API_BASE_URL || 'https://oapi.dingtalk.com';
    this.newBaseURL = 'https://api.dingtalk.com';
    this.corpId = process.env.DINGTALK_CORP_ID;
    this.clientId = process.env.DINGTALK_CLIENT_ID;
    this.clientSecret = process.env.DINGTALK_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;

    // 默认花名册字段过滤列表（优化请求体体积与RT）
    // 说明：包含用户提供的搜索字段，并补充前端现用关键字段，避免回归
    this.DEFAULT_FIELD_CODES = [
      // 用户提供字段
      'sys00-name','sys00-email','sys00-deptIds','sys00-mainDeptId','sys00-dept','sys00-mainDept','sys00-position','sys00-mobile','sys00-jobNumber','sys00-tel','sys00-workPlace','sys00-remark','sys00-confirmJoinTime','sys01-employeeType','sys01-employeeStatus','sys01-probationPeriodType','sys01-regularTime','sys01-positionLevel','sys02-realName','sys02-certNo','sys02-birthTime','sys02-sexType','sys02-nationType','sys02-certAddress','sys02-certEndTime','sys02-marriage','sys02-joinWorkingTime','sys02-residenceType','sys02-address','sys02-politicalStatus','sys09-personalSi','sys09-personalHf','sys03-highestEdu','sys03-graduateSchool','sys03-graduationTime','sys03-major','sys04-bankAccountNo','sys04-accountBank','sys05-contractCompanyName','sys05-contractType','sys05-firstContractStartTime','sys05-firstContractEndTime','sys05-nowContractStartTime','sys05-nowContractEndTime','sys05-contractPeriodType','sys05-contractRenewCount','sys06-urgentContactsName','sys06-urgentContactsRelation','sys06-urgentContactsPhone','sys07-haveChild','sys07-childName','sys07-childSex','sys07-childBirthDate',
      // 为保证前端字段解析完整，补充关键字段
      'sys01-name','sys01-email','sys01-mobile',
      'sys01-mainDept','sys01-mainDeptName','sys00-mainDeptName',
      'sys01-position',
      'sys01-hiredDate','sys01-entryTime','sys00-hiredDate','sys00-entryTime'
    ];
  }

  // 更新API凭证
  updateCredentials(corpId, clientId, clientSecret) {
    console.log('🔑 更新钉钉API凭证...');
    this.corpId = corpId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    // 清除旧的access token，强制重新获取
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log('✅ API凭证已更新');
  }

  // 获取access_token - 使用新的v1.0 API格式，包含corpId
  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔑 获取钉钉Access Token...');
      
      if (!this.corpId || !this.clientId || !this.clientSecret) {
        throw new Error('缺少必要的认证参数：corpId, clientId, clientSecret');
      }

      const response = await axios.post(`${this.newBaseURL}/v1.0/oauth2/${this.corpId}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP错误: ${response.status} - ${response.statusText}`);
      }

      if (!response.data.access_token) {
        throw new Error(`获取Access Token失败: ${JSON.stringify(response.data)}`);
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000; // 提前5分钟过期

      console.log('✅ Access Token获取成功，有效期:', response.data.expires_in, '秒');
      return this.accessToken;

    } catch (error) {
      console.error('❌ 获取Access Token失败:', error.message);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
      throw error;
    }
  }

  // 批量获取员工花名册信息
  async getEmployeeRosterInfo(userIdList) {
    try {
      const token = await this.getAccessToken();
      
      // 将用户ID数组转换为逗号分隔的字符串
      const userIdString = Array.isArray(userIdList) ? userIdList.join(',') : userIdList;
      
      console.log(`🔍 开始获取员工花名册信息: ${userIdString}`);
      
      // 使用花名册API获取员工详细信息
      const response = await axios.post(`${this.oldBaseURL}/topapi/smartwork/hrm/employee/v2/list`, {
        userid_list: userIdString,
        agentid: parseInt(this.clientId) || 1, // 使用clientId作为agentid，或默认值1
        // 使用字段过滤以优化RT与响应体积
        field_filter_list: this.DEFAULT_FIELD_CODES.join(',')
      }, {
        params: {
          access_token: token
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log(`📋 花名册API响应:`, JSON.stringify(response.data, null, 2));

      if (response.data.errcode !== 0) {
        throw new Error(`钉钉花名册API错误: ${response.data.errcode} - ${response.data.errmsg}`);
      }

      // 解析花名册数据
      const rosterData = this.parseRosterData(response.data.result);
      console.log(`✅ 花名册信息获取成功，共${rosterData.length}条记录`);
      
      return rosterData;

    } catch (error) {
      console.error(`❌ 获取员工花名册信息失败:`, error.message);
      if (error.response) {
        console.error(`❌ 花名册API错误响应:`, JSON.stringify(error.response.data, null, 2));
      }
      return [];
    }
  }

  // 工具: 休眠
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 工具: 分片
  chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  // 工具: 并发执行控制
  async runWithConcurrency(tasks, concurrency = 3) {
    const results = [];
    let current = 0;
    const workers = new Array(Math.min(concurrency, tasks.length)).fill(0).map(async () => {
      while (current < tasks.length) {
        const index = current++;
        try {
          const res = await tasks[index]();
          results[index] = res;
        } catch (e) {
          results[index] = { error: e };
        }
      }
    });
    await Promise.all(workers);
    return results;
  }

  // 合并同一用户多次返回的字段数据
  mergeFieldData(existingList = [], incomingList = []) {
    const map = new Map();
    for (const item of existingList) {
      map.set(item.field_code, item);
    }
    for (const item of incomingList) {
      map.set(item.field_code, item);
    }
    return Array.from(map.values());
  }

  // 兼容老接口: 将 field_list 规范化为 field_data_list 结构
  normalizeLegacyEmployees(legacyEmployees = []) {
    return (legacyEmployees || []).map(emp => {
      const fieldList = emp.field_list || [];
      const field_data_list = fieldList.map(f => ({
        field_code: f.field_code,
        field_name: f.field_name,
        group_id: f.group_id,
        field_value_list: [{
          item_index: 0,
          value: (f.value !== undefined && f.value !== null) ? f.value : (f.label || ''),
          label: (f.label !== undefined && f.label !== null) ? f.label : (f.value || '')
        }]
      }));
      return {
        userid: emp.userid,
        partner: emp.partner,
        field_data_list
      };
    });
  }

  // 旧版花名册API：补齐缺失字段（如 sys00-*）
  async getEmployeeRosterInfoLegacy(userIdList, options = {}) {
    try {
      const token = await this.getAccessToken();
      const users = Array.isArray(userIdList) ? userIdList : String(userIdList).split(',').map(s => s.trim()).filter(Boolean);

      const userIdString = users.join(',');
      console.log(`🔎 使用旧版花名册API补齐字段: ${userIdString}`);

      const response = await axios.post(`${this.oldBaseURL}/topapi/smartwork/hrm/employee/list`, {
        userid_list: userIdString,
        agentid: parseInt(this.clientId) || 1,
        // 不传 field_filter_list 获取全部 sys00 字段，最大20个/次
        ...(options.field_filter_list ? { field_filter_list: options.field_filter_list } : {})
      }, {
        params: { access_token: token },
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data.errcode !== 0) {
        throw new Error(`旧版花名册API错误: ${response.data.errcode} - ${response.data.errmsg}`);
      }

      const normalized = this.normalizeLegacyEmployees(response.data.result || []);
      return normalized;

    } catch (e) {
      console.error('❌ 旧版花名册补齐失败: ', e.message);
      return [];
    }
  }

  // 高级版: 大批量、可控并发、字段分片获取花名册信息，并合并字段
  async getEmployeeRosterInfoAdvanced(userIdList = [], options = {}) {
    const {
      // 默认使用优化后的字段集合；如需全量，调用方可显式传入 null
      fieldCodes = this.DEFAULT_FIELD_CODES, // Array<string> | null
      batchSize = 100,   // userid 每批最多100
      fieldBatchSize = 100, // v2 每次最多100个字段
      concurrency = 3,
      retry = 2,
    } = options;

    if (!Array.isArray(userIdList) || userIdList.length === 0) {
      return [];
    }

    const token = await this.getAccessToken();

    const userBatches = this.chunkArray(userIdList, Math.min(batchSize, 100));
    const fieldBatches = Array.isArray(fieldCodes) && fieldCodes.length > 0
      ? this.chunkArray(fieldCodes, Math.min(fieldBatchSize, 100))
      : [null]; // 兼容：显式传入 null 时，拿全量

    const tasks = [];
    for (const users of userBatches) {
      for (const fields of fieldBatches) {
        const userIdString = users.join(',');
        const fieldFilterStr = Array.isArray(fields) ? fields.join(',') : undefined;
        tasks.push(async () => {
          let attempt = 0;
          while (true) {
            try {
              const resp = await axios.post(`${this.oldBaseURL}/topapi/smartwork/hrm/employee/v2/list`, {
                userid_list: userIdString,
                agentid: parseInt(this.clientId) || 1,
                ...(fieldFilterStr ? { field_filter_list: fieldFilterStr } : {})
              }, {
                params: { access_token: token },
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
              });
              if (resp.data.errcode !== 0) {
                throw new Error(`钉钉花名册API错误: ${resp.data.errcode} - ${resp.data.errmsg}`);
              }
              return resp.data.result || [];
            } catch (e) {
              const status = e?.response?.status;
              if (attempt < retry && (status === 429 || e.code === 'ECONNABORTED')) {
                const backoff = Math.min(2000 * Math.pow(2, attempt), 8000);
                console.warn(`⚠️ 花名册调用失败，重试第 ${attempt + 1} 次，等待 ${backoff}ms:`, e.message);
                await this.sleep(backoff);
                attempt++;
                continue;
              }
              throw e;
            }
          }
        });
      }
    }

    console.log(`📦 计划执行花名册请求 ${tasks.length} 个 (用户批次 ${userBatches.length} × 字段批次 ${fieldBatches.length})，并发 ${concurrency}`);
    const allResults = await this.runWithConcurrency(tasks, concurrency);

    // 聚合合并结果: userid -> field_data_list 合并
    const userMap = new Map();
    for (const part of allResults) {
      if (!part || part.error) continue;
      for (const emp of part) {
        const existed = userMap.get(emp.userid);
        if (!existed) {
          userMap.set(emp.userid, {
            ...emp,
            field_data_list: Array.isArray(emp.field_data_list) ? emp.field_data_list.slice() : [],
          });
        } else {
          existed.field_data_list = this.mergeFieldData(existed.field_data_list, emp.field_data_list);
          userMap.set(emp.userid, existed);
        }
      }
    }

    let mergedList = Array.from(userMap.values());

    // 检查缺失的关键字段（部门/入职日期），必要时用旧版API补齐 sys00 字段
    const needLegacyUserIds = [];
    for (const emp of mergedList) {
      const fd = emp.field_data_list || [];
      const deptName = this.getFieldValue(fd, 'sys01-mainDeptName') || this.getFieldValue(fd, 'sys00-mainDeptName');
      const hired = this.getFieldValue(fd, 'sys01-hiredDate') || this.getFieldValue(fd, 'sys01-entryTime') || this.getFieldValue(fd, 'sys00-hiredDate') || this.getFieldValue(fd, 'sys00-entryTime');
      if (!deptName || !hired) {
        needLegacyUserIds.push(emp.userid);
      }
    }

    if (needLegacyUserIds.length > 0) {
      console.log(`🧩 有 ${needLegacyUserIds.length} 个用户缺失关键字段，使用旧版API补齐...`);
      const legacyBatchSize = 50;
      for (let i = 0; i < needLegacyUserIds.length; i += legacyBatchSize) {
        const batch = needLegacyUserIds.slice(i, i + legacyBatchSize);
        const legacyPart = await this.getEmployeeRosterInfoLegacy(batch);
        for (const leg of legacyPart) {
          const existed = userMap.get(leg.userid);
          if (existed) {
            existed.field_data_list = this.mergeFieldData(existed.field_data_list || [], leg.field_data_list || []);
            userMap.set(leg.userid, existed);
          } else {
            userMap.set(leg.userid, leg);
          }
        }
      }
      mergedList = Array.from(userMap.values());
    }

    // 再次检查部门ID缺失，最后使用用户详情API补充部门ID（部门名称可能仍为空）
    const needDeptIds = [];
    for (const emp of mergedList) {
      const fd = emp.field_data_list || [];
      const deptId = this.getFieldValue(fd, 'sys01-mainDept') || this.getFieldValue(fd, 'sys00-mainDept');
      if (!deptId) needDeptIds.push(emp.userid);
    }

    if (needDeptIds.length > 0) {
      console.log(`🧯 仍有 ${needDeptIds.length} 个用户缺少部门ID，尝试通过用户详情API补充...`);
      const tasksDept = needDeptIds.map(uid => async () => {
        const info = await this.getUserDetail(uid);
        const list = info?.dept_id_list || info?.deptIdList || [];
        const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
        return { userid: uid, deptId: first };
      });
      const deptResults = await this.runWithConcurrency(tasksDept, 5);
      for (const d of deptResults) {
        if (!d || !d.deptId) continue;
        const existed = userMap.get(d.userid);
        if (existed) {
          const patchField = {
            field_code: 'sys01-mainDept',
            field_name: '主部门',
            group_id: 'sys01',
            field_value_list: [{ item_index: 0, value: d.deptId, label: String(d.deptId) }]
          };
          existed.field_data_list = this.mergeFieldData(existed.field_data_list || [], [patchField]);
          userMap.set(d.userid, existed);
        }
      }
      mergedList = Array.from(userMap.values());
    }

    // 复用已有解析逻辑，保留 rawRosterData
    return this.parseRosterData(mergedList);
  }

  // 解析花名册数据，提取常用字段
  parseRosterData(rosterResult) {
    if (!rosterResult || !Array.isArray(rosterResult)) {
      return [];
    }

    return rosterResult.map(employee => {
      const fieldData = employee.field_data_list || [];

      // 容错：兼容不同版本的字段编码（sys00 与 sys01）
      const name = this.getFieldValue(fieldData, 'sys01-name') || this.getFieldValue(fieldData, 'sys00-name') || employee.userid;
      const mobile = this.getFieldValue(fieldData, 'sys01-mobile') || this.getFieldValue(fieldData, 'sys00-mobile') || '';
      const email = this.getFieldValue(fieldData, 'sys01-email') || this.getFieldValue(fieldData, 'sys00-email') || '';
      const departmentId = this.getFieldValue(fieldData, 'sys01-mainDept') || this.getFieldValue(fieldData, 'sys00-mainDept') || 0;
      const departmentName = this.getFieldValue(fieldData, 'sys01-mainDeptName') || this.getFieldValue(fieldData, 'sys00-mainDeptName') || '未知部门';
      const title = this.getFieldValue(fieldData, 'sys01-position') || this.getFieldValue(fieldData, 'sys01-positionLevel') || this.getFieldValue(fieldData, 'sys00-position') || this.getFieldValue(fieldData, 'sys00-positionLevel') || '';
      // 入职日期：优先按 field_code 取值，若无则按中文名匹配（例如“入职日期”、“入职时间”）
      const hiredRaw = this.getFieldValue(fieldData, 'sys01-hiredDate')
        || this.getFieldValue(fieldData, 'sys01-entryTime')
        || this.getFieldValue(fieldData, 'sys00-hiredDate')
        || this.getFieldValue(fieldData, 'sys00-entryTime')
        || this.getFieldValueByName?.(fieldData, ['入职日期', '入职时间'])
        || '';
      const hiredDate = this.normalizeDate ? this.normalizeDate(hiredRaw) : hiredRaw;

      const parsedEmployee = {
        userid: employee.userid,
        name,
        mobile,
        email,
        department: departmentId,
        departmentName,
        title,
        hiredDate,
        rawRosterData: employee // 保留原始花名册数据
      };

      console.log(`📝 解析员工数据 ${parsedEmployee.userid}:`, parsedEmployee.name, '/', parsedEmployee.departmentName, `(#${parsedEmployee.department})`);
      return parsedEmployee;
    });
  }

  // 从字段数据中提取指定字段的值
  getFieldValue(fieldDataList, fieldCode) {
    const field = fieldDataList.find(f => f.field_code === fieldCode);
    if (field && field.field_value_list && field.field_value_list.length > 0) {
      const first = field.field_value_list[0];
      // value 优先，其次 label
      const val = first.value ?? first.label ?? '';
      // 尝试将纯数字字符串转为数值型（如部门ID）
      if (typeof val === 'string' && /^\d+$/.test(val)) {
        try { return Number(val); } catch (_) { return val; }
      }
      return val;
    }
    return '';
  }

  // 通过字段中文名匹配获取值（例如 "入职日期"）
  getFieldValueByName(fieldDataList, fieldNames = []) {
    if (!Array.isArray(fieldNames)) fieldNames = [fieldNames];
    const names = new Set(fieldNames.filter(Boolean));
    const field = (fieldDataList || []).find(f => names.has(f.field_name));
    if (field && field.field_value_list && field.field_value_list.length > 0) {
      const first = field.field_value_list[0];
      return first.value ?? first.label ?? '';
    }
    return '';
  }

  // 规范化日期：支持时间戳(秒/毫秒)与可解析字符串，统一返回 YYYY-MM-DD
  normalizeDate(val) {
    if (val === null || val === undefined || val === '') return '';
    const s = typeof val === 'number' ? String(val) : String(val).trim();
    if (/^\d+$/.test(s)) {
      let n = Number(s);
      if (s.length === 10) n = n * 1000; // 秒级
      const d = new Date(n);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    const d2 = new Date(s.replace(' ', 'T'));
    if (!isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return String(val);
  }

  // 获取用户详细信息 (保留作为备用方法)
  async getUserDetail(userId) {
    try {
      const token = await this.getAccessToken();
      
      console.log(`🔍 开始获取用户详情: ${userId}`);
      
      const response = await axios.post(`${this.oldBaseURL}/topapi/v2/user/get`, {
        userid: userId,
        language: 'zh_CN'
      }, {
        params: {
          access_token: token
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`📋 用户详情API响应 ${userId}:`, JSON.stringify(response.data, null, 2));

      if (response.data.errcode !== 0) {
        throw new Error(`钉钉API错误: ${response.data.errcode} - ${response.data.errmsg}`);
      }

      console.log(`✅ 用户详情获取成功 ${userId}:`, response.data.result?.name || 'Unknown');
      return response.data.result;

    } catch (error) {
      console.error(`❌ 获取用户详情失败 ${userId}:`, error.message);
      if (error.response) {
        console.error(`❌ 用户详情API错误响应 ${userId}:`, JSON.stringify(error.response.data, null, 2));
      }
      return null;
    }
  }

  // 通用API调用方法
  async callDingTalkAPI(endpoint, params = {}) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.oldBaseURL}${endpoint}`;
      
      console.log(`📞 调用钉钉API: ${endpoint}`);
      
      const response = await axios.get(url, {
        params: {
          access_token: token,
          ...params
        },
        timeout: 30000
      });

      if (response.data.errcode !== 0) {
        throw new Error(`钉钉API错误: ${response.data.errcode} - ${response.data.errmsg}`);
      }

      return response.data;

    } catch (error) {
      if (error.response && error.response.status === 429) {
        throw new Error('API调用频率超限，请稍后重试');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('API调用超时，请检查网络连接');
      }

      console.error(`❌ API调用失败 ${endpoint}:`, error.message);
      throw error;
    }
  }

  // 获取在职员工列表 - 使用智能人事API
  async getActiveEmployees() {
    try {
      console.log('👥 获取在职员工列表...');
      
      const token = await this.getAccessToken();
      let allEmployees = [];
      let allUserIds = [];
      let offset = 0;
      const size = 50;
      let hasMore = true;

      while (hasMore) {
        console.log(`📞 调用在职员工API，offset: ${offset}`);
        const response = await axios.post(`${this.oldBaseURL}/topapi/smartwork/hrm/employee/queryonjob`, {
          status_list: "2,3,5,-1", // 试用期、正式、待离职、无状态
          offset: offset,
          size: size
        }, {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });

        if (response.data.errcode !== 0) {
          throw new Error(`钉钉API错误: ${response.data.errcode} - ${response.data.errmsg}`);
        }

        const result = response.data.result;
        if (result && Array.isArray(result.data_list) && result.data_list.length > 0) {
          allUserIds.push(...result.data_list);
        }

        hasMore = result && result.next_cursor;
        if (hasMore) {
          offset = result.next_cursor;
        }
      }

      // 并发批量拉取花名册信息并合并字段
      if (allUserIds.length > 0) {
        console.log(`📦 共收集到在职用户 ${allUserIds.length} 个，开始批量获取花名册信息（并发处理）`);
        const rosterData = await this.getEmployeeRosterInfoAdvanced(allUserIds, { concurrency: 5 });
        for (const employee of rosterData) {
          allEmployees.push({
            userid: employee.userid,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            department: employee.department || 0,
            departmentName: employee.departmentName,
            title: employee.title,
            hiredDate: employee.hiredDate,
            active: true,
            rawData: employee.rawRosterData
          });
        }
      } else {
        console.log('📋 在职员工API未返回任何用户ID');
      }

      console.log(`✅ 获取到 ${allEmployees.length} 名在职员工`);
      return allEmployees;

    } catch (error) {
      console.error('❌ 获取在职员工失败:', error.message);
      throw error; // 直接抛出错误，不使用模拟数据
    }
  }

  // 获取待入职员工列表 - 使用智能人事API
  async getPendingEmployees() {
    try {
      console.log('⏳ 获取待入职员工列表...');
      
      const token = await this.getAccessToken();
      let allEmployees = [];
      let allUserIds = [];
      let offset = 0;
      const size = 50;
      let hasMore = true;

      while (hasMore) {
        console.log(`📞 调用待入职员工API，offset: ${offset}`);
        const response = await axios.post(`${this.oldBaseURL}/topapi/smartwork/hrm/employee/querypreentry`, {
          offset: offset,
          size: size
        }, {
          params: { access_token: token },
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });

        if (response.data.errcode !== 0) {
          throw new Error(`钉钉API错误: ${response.data.errcode} - ${response.data.errmsg}`);
        }

        const result = response.data.result;
        if (result && Array.isArray(result.data_list) && result.data_list.length > 0) {
          allUserIds.push(...result.data_list);
        }

        hasMore = result && result.next_cursor;
        if (hasMore) {
          offset = result.next_cursor;
        }
      }

      if (allUserIds.length > 0) {
        console.log(`📦 共收集到待入职用户 ${allUserIds.length} 个，开始批量获取花名册信息（并发处理）`);
        const rosterData = await this.getEmployeeRosterInfoAdvanced(allUserIds, { concurrency: 5 });
        for (const employee of rosterData) {
          allEmployees.push({
            userid: employee.userid,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            department: employee.department || 0,
            departmentName: employee.departmentName,
            title: employee.title,
            hiredDate: employee.hiredDate,
            active: false,
            rawData: employee.rawRosterData
          });
        }
      }

      console.log(`✅ 获取到 ${allEmployees.length} 名待入职员工`);
      return allEmployees;

    } catch (error) {
      console.error('❌ 获取待入职员工失败:', error.message);
      throw error; // 直接抛出错误，不使用模拟数据
    }
  }

  // 获取离职员工列表 - 使用HRM 1.0 API
  async getDepartedEmployees() {
    try {
      console.log('🚪 获取离职员工列表...');
      
      const token = await this.getAccessToken();
      let allEmployees = [];
      let allUserIds = [];
      let nextToken = 0;
      const maxResults = 50;
      let hasMore = true;

      while (hasMore) {
        console.log(`📞 调用离职员工API，次标记 nextToken: ${nextToken}`);
        const response = await axios.get(`${this.newBaseURL}/v1.0/hrm/employees/dismissions`, {
          params: { nextToken: nextToken, maxResults: maxResults },
          headers: {
            'x-acs-dingtalk-access-token': token,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        if (response.status !== 200) {
          throw new Error(`HTTP错误: ${response.status}`);
        }

        const result = response.data;
        if (result && Array.isArray(result.userIdList) && result.userIdList.length > 0) {
          allUserIds.push(...result.userIdList);
        }

        hasMore = result && result.hasMore;
        if (hasMore) {
          nextToken = result.nextToken;
        }
      }

      if (allUserIds.length > 0) {
        console.log(`📦 共收集到离职用户 ${allUserIds.length} 个，开始批量获取花名册信息（并发处理）`);
        const rosterData = await this.getEmployeeRosterInfoAdvanced(allUserIds, { concurrency: 5 });
        for (const employee of rosterData) {
          allEmployees.push({
            userid: employee.userid,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email,
            department: employee.department || 0,
            departmentName: employee.departmentName,
            title: employee.title,
            hiredDate: employee.hiredDate,
            departedDate: '', // 花名册可能不包含离职日期
            active: false,
            rawData: employee.rawRosterData
          });
        }
      }

      console.log(`✅ 获取到 ${allEmployees.length} 名离职员工`);
      return allEmployees;

    } catch (error) {
      console.error('❌ 获取离职员工失败:', error.message);
      throw error; // 直接抛出错误，不使用模拟数据
    }
  }

}

module.exports = new DingTalkService();

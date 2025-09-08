import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Table, 
  message, 
  Tag, 
  Typography, 
  Space, 
  Statistic, 
  Row, 
  Col,
  Alert,
  Spin,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm
} from 'antd';
import { 
  SyncOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  SettingOutlined,
  ApiOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import Docs from './Docs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [route, setRoute] = useState(() => (window.location.hash === '#/docs' ? 'docs' : 'poc'));
  const goto = useCallback((view) => {
    const hash = view === 'docs' ? '#/docs' : '#/poc';
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(view);
    }
  }, []);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash === '#/docs' ? 'docs' : 'poc');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    departed: 0
  });
  
  // API配置相关状态
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    corpId: '',
    clientId: '',
    clientSecret: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [form] = Form.useForm();

  // 页面加载时获取员工数据
  useEffect(() => {
    fetchEmployees();
    // 检查是否已有配置
    const savedConfig = localStorage.getItem('dingtalk-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setApiConfig(config);
      setIsConfigured(true);
      form.setFieldsValue(config);
    }
  }, [form]);

  // 获取员工数据
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employees');
      
      if (response.data.success) {
        const employeeData = response.data.data;
        setEmployees(employeeData);
        
        // 计算统计数据
        const stats = {
          total: employeeData.length,
          active: employeeData.filter(emp => emp.status === '在职').length,
          pending: employeeData.filter(emp => emp.status === '待入职').length,
          departed: employeeData.filter(emp => emp.status === '离职').length
        };
        setStats(stats);
        
        console.log('✅ 员工数据加载成功:', stats);
      }
    } catch (error) {
      console.error('❌ 获取员工数据失败:', error);
      message.error('获取员工数据失败，请检查后端服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  // 配置API凭证
  const handleConfigSubmit = (values) => {
    console.log('🔧 保存API配置:', values);
    setApiConfig(values);
    setIsConfigured(true);
    // 保存到本地存储
    localStorage.setItem('dingtalk-config', JSON.stringify(values));
    setConfigModalVisible(false);
    message.success('钉钉API配置已保存！');
  };

  // 手动同步数据
  const handleSyncData = async () => {
    if (!isConfigured) {
      message.warning('请先配置钉钉API信息');
      setConfigModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      setSyncStatus({ type: 'loading', message: '正在同步数据，请稍候...' });
      
      console.log('🚀 开始手动数据同步...');
      
      const response = await axios.post('/api/sync-employees', {
        corpId: apiConfig.corpId,
        clientId: apiConfig.clientId,
        clientSecret: apiConfig.clientSecret
      });
      
      if (response.data.success) {
        setSyncStatus({
          type: 'success',
          message: `同步成功！处理了 ${response.data.data.totalProcessed} 条记录`,
          details: response.data.data
        });
        setLastSyncTime(new Date());
        
        // 重新获取数据以更新界面
        await fetchEmployees();
        
        message.success('数据同步成功！');
        console.log('✅ 数据同步完成:', response.data.data);
      } else {
        throw new Error(response.data.message || '同步失败');
      }
    } catch (error) {
      console.error('❌ 数据同步失败:', error);
      setSyncStatus({
        type: 'error',
        message: `同步失败: ${error.response?.data?.message || error.message}`,
        error: error.response?.data
      });
      message.error('数据同步失败，请查看详细错误信息');
    } finally {
      setLoading(false);
    }
  };

  // 清空员工数据
  const handleClearEmployees = async () => {
    try {
      setLoading(true);
      await axios.delete('/api/employees');
      setEmployees([]);
      setStats({ total: 0, active: 0, pending: 0, departed: 0 });
      setSyncStatus(null);
      message.success('已清空員工數據');
    } catch (error) {
      console.error('❌ 清空員工數據失敗:', error);
      message.error('清空失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '员工ID',
      dataIndex: 'userid',
      key: 'userid',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          '在职': { color: 'success', icon: <CheckCircleOutlined /> },
          '待入职': { color: 'processing', icon: <ClockCircleOutlined /> },
          '离职': { color: 'default', icon: <StopOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', icon: null };
        return (
          <Tag color={config.color} className="status-badge">
            {config.icon}
            {status}
          </Tag>
        );
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (value) => (value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '-'),
    },
    {
      title: '职位',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || '-',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-',
    },
    {
      title: '入职日期',
      dataIndex: 'hiredDate',
      key: 'hiredDate',
      render: (text) => text ? moment(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  if (route === 'docs') {
    return <Docs onNavigate={() => goto('poc')} />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          钉钉-Apollo 数据集成 POC
        </Title>
        <Space>
          <Button onClick={() => goto('docs')}>API 說明</Button>
        </Space>
      </Header>
      
      <Content className="main-container">
        {/* 统计面板 */}
        <Card className="page-header" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总员工数"
                value={stats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="在职员工"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="待入职"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已离职"
                value={stats.departed}
                prefix={<StopOutlined />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 同步操作面板 */}
        <Card className="sync-section" title="数据同步操作">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>配置钉钉API信息后，点击同步按钮获取真实数据</Text>
                {isConfigured && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      企业ID: {apiConfig.corpId?.slice(0, 15)}***
                    </Text>
                  </div>
                )}
                {lastSyncTime && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      上次同步时间: {moment(lastSyncTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </div>
                )}
              </div>
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setConfigModalVisible(true)}
                  type={isConfigured ? "default" : "dashed"}
                >
                  {isConfigured ? '修改配置' : '配置API'}
                </Button>
                <Popconfirm
                  title="確定清空當前員工數據嗎？"
                  okText="清空"
                  cancelText="取消"
                  onConfirm={handleClearEmployees}
                >
                  <Button danger icon={<DeleteOutlined />} loading={loading && !syncStatus}>
                    清空數據
                  </Button>
                </Popconfirm>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchEmployees}
                  loading={loading && !syncStatus}
                >
                  刷新数据
                </Button>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={handleSyncData}
                  loading={loading && syncStatus}
                  size="large"
                  disabled={!isConfigured}
                >
                  同步员工数据
                </Button>
              </Space>
            </div>
            
            {/* 同步状态显示 */}
            {syncStatus && (
              <Alert
                message={syncStatus.message}
                type={syncStatus.type === 'error' ? 'error' : syncStatus.type === 'success' ? 'success' : 'info'}
                showIcon
                action={
                  syncStatus.type === 'success' && syncStatus.details && (
                    <Text code>
                      在职:{syncStatus.details.breakdown.active} | 
                      待入职:{syncStatus.details.breakdown.pending} | 
                      离职:{syncStatus.details.breakdown.departed}
                    </Text>
                  )
                }
              />
            )}
          </Space>
        </Card>

        {/* 员工数据表格 */}
        <Card 
          className="data-section" 
          title={
            <div className="table-header">
              <span>员工数据列表</span>
              <Text type="secondary">
                共 {employees.length} 条记录
              </Text>
            </div>
          }
        >
          {loading && !syncStatus ? (
            <div className="loading-container">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={employees}
              rowKey="id"
              pagination={{
                total: employees.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              }}
              size="middle"
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        <Divider />
        
        {/* 页脚信息 */}
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
          <Text type="secondary">
            钉钉员工数据集成Apollo系统 POC Demo
          </Text>
        </div>
      </Content>

      {/* API配置模态框 */}
      <Modal
        title={
          <Space>
            <ApiOutlined />
            钉钉API配置
          </Space>
        }
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="配置说明"
          description="请输入您的钉钉企业信息和应用认证，系统将使用这些信息获取Access Token并调用智能人事API获取真实员工数据。"
          type="info"
          style={{ marginBottom: 24 }}
          showIcon
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConfigSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="企业ID (Corp ID)"
            name="corpId"
            rules={[
              { required: true, message: '请输入钉钉企业ID' },
              { min: 10, message: '企业ID长度至少10位' }
            ]}
            extra="格式：dingxxxxxxxxxxxxxxxxxxxxxxx"
          >
            <Input
              placeholder="请输入钉钉企业ID"
              prefix={<TeamOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="客户端ID (Client ID)"
            name="clientId"
            rules={[
              { required: true, message: '请输入钉钉客户端ID' },
              { min: 10, message: '客户端ID长度至少10位' }
            ]}
            extra="您的钉钉企业内部应用的Client ID"
          >
            <Input
              placeholder="请输入钉钉客户端ID"
              prefix={<ApiOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="客户端密钥 (Client Secret)"
            name="clientSecret"
            rules={[
              { required: true, message: '请输入钉钉客户端密钥' },
              { min: 20, message: '客户端密钥长度至少20位' }
            ]}
            extra="您的钉钉企业内部应用的Client Secret"
          >
            <Input.Password
              placeholder="请输入钉钉客户端密钥"
              prefix={<SettingOutlined />}
            />
          </Form.Item>

          <Alert
            message="权限要求"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>需要创建钉钉企业内部应用</li>
                <li>需要开通智能人事应用</li>
                <li>需要"智能人事个人信息读权限"</li>
                <li>Access Token通过 corpId + clientId + clientSecret 获取</li>
                <li>Token有效期为7200秒(2小时)，系统自动管理续期</li>
                <li>建议先在钉钉开发者后台测试API连通性</li>
              </ul>
            }
            type="warning"
            style={{ margin: '16px 0' }}
            showIcon
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;

import React, { useEffect } from 'react';
import { Layout, Typography, Divider, Descriptions, Tag, Alert, Space, Button, Card } from 'antd';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function FlowSvg() {
  // 加入泳道區塊、連線標註，並提高字體清晰度（描邊 + 更大字級 + 高對比色）
  const titleStyle = { fontSize: 18, fontWeight: 700, fill: '#0B1F33', paintOrder: 'stroke fill', stroke: '#fff', strokeWidth: 3 };
  const smallTitleStyle = { fontSize: 16, fontWeight: 700, fill: '#0B1F33', paintOrder: 'stroke fill', stroke: '#fff', strokeWidth: 2 };
  const subStyle = { fontSize: 14, fill: '#1f4d7a', paintOrder: 'stroke fill', stroke: '#fff', strokeWidth: 2 };
  const laneStyle = { fontSize: 13, fontWeight: 600, fill: '#052c65' };

  return (
    <svg width="100%" height="780" viewBox="0 0 1400 780" role="img" aria-label="資料流程圖" style={{ textRendering: 'geometricPrecision', shapeRendering: 'crispEdges' }}>
      <defs>
        <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#1890ff" />
        </marker>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#e6f4ff" floodOpacity="1" />
        </filter>
      </defs>

      {/* 泳道 */}
      <g opacity="0.95">
        <rect x="20" y="30" width="1360" height="110" rx="8" fill="#eef5ff" />
        <text x="30" y="65" style={laneStyle}>認證</text>

        <rect x="20" y="160" width="1360" height="150" rx="8" fill="#f3fff0" />
        <text x="30" y="195" style={laneStyle}>人員 ID 收集</text>

        {/* 新增：彙總層 */}
        <rect x="20" y="330" width="1360" height="120" rx="8" fill="#f0f7ff" />
        <text x="30" y="365" style={laneStyle}>彙總層</text>

        <rect x="20" y="480" width="1360" height="170" rx="8" fill="#e8fffb" />
        <text x="30" y="515" style={laneStyle}>花名冊字段（批量）</text>

        <rect x="20" y="670" width="1360" height="170" rx="8" fill="#fff8e1" />
        <text x="30" y="705" style={laneStyle}>合併與落地</text>
      </g>

      {/* 連線（圓角貝茲曲線，置於節點之前，避免覆蓋節點） */}
      <g stroke="#1677ff" strokeWidth="2.6" markerEnd="url(#arrow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Token -> 各接口（虛線曲線） */}
        <path d="M380,126 C380,165 380,190 380,220" strokeDasharray="6 4" />
        <path d="M380,126 C560,160 760,175 690,220" strokeDasharray="6 4" />
        <path d="M380,126 C720,160 950,175 1010,220" strokeDasharray="6 4" />
        <path d="M380,126 C900,175 1100,270 700,360" strokeDasharray="6 4" />

        {/* 三類 ID -> 彙總（向下匯聚） */}
        <path d="M370,258 C500,320 600,350 700,390" />
        <path d="M690,258 C720,320 680,350 700,390" />
        <path d="M1010,258 C900,320 780,350 700,390" />

        {/* 彙總 ID -> 花名冊 v2（左向曲線） */}
        <path d="M700,435 C640,490 620,510 740,540" />

        {/* 花名冊 v2 -> 合併（順滑折線） */}
        <path d="M540,606 C500,650 470,690 440,710" />

        {/* 補齊來源 -> 合併（兩條曲線避免交疊） */}
        <path d="M930,606 C820,660 700,710 580,730" />
        <path d="M1240,606 C1100,680 820,710 580,730" />

        {/* 合併 -> ETL -> Apollo（直線） */}
        <path d="M600,750 L660,750" />
        <path d="M980,750 L1040,750" />
      </g>

      {/* 節點 */}
      <g fill="#fff" stroke="#1890ff" strokeWidth="2" filter="url(#shadow)">
        {/* 認證 */}
        <rect x="200" y="50" width="360" height="80" rx="10" />
        <text x="380" y="90" textAnchor="middle" style={titleStyle}>後端獲取 Access Token</text>
        <text x="380" y="112" textAnchor="middle" style={subStyle}>POST /v1.0/oauth2/{'{corpId}'}/token</text>

        {/* 人員ID */}
        <rect x="220" y="210" width="300" height="80" rx="10" />
        <text x="370" y="250" textAnchor="middle" style={titleStyle}>在職：queryonjob</text>
        <text x="370" y="273" textAnchor="middle" style={subStyle}>/topapi/.../queryonjob</text>

        <rect x="540" y="210" width="300" height="80" rx="10" />
        <text x="690" y="250" textAnchor="middle" style={titleStyle}>待入職：querypreentry</text>
        <text x="690" y="273" textAnchor="middle" style={subStyle}>/topapi/.../querypreentry</text>

        <rect x="860" y="210" width="300" height="80" rx="10" />
        <text x="1010" y="250" textAnchor="middle" style={titleStyle}>離職：dismissions</text>
        <text x="1010" y="273" textAnchor="middle" style={subStyle}>GET /v1.0/.../dismissions</text>

        {/* 彙總人員 ID 置中顯示 */}
        <rect x="570" y="345" width="260" height="80" rx="10" />
        <text x="700" y="385" textAnchor="middle" style={titleStyle}>彙總人員 ID</text>

        {/* 花名冊 */}
        <rect x="320" y="520" width="420" height="80" rx="10" />
        <text x="530" y="560" textAnchor="middle" style={titleStyle}>批量花名冊字段 (v2)</text>
        <text x="530" y="584" textAnchor="middle" style={subStyle}>/topapi/smartwork/hrm/employee/v2/list</text>

        {/* 兜底補齊 */}
        <rect x="770" y="520" width="300" height="80" rx="10" />
        <text x="920" y="560" textAnchor="middle" style={titleStyle}>舊版花名冊：list</text>
        <text x="920" y="584" textAnchor="middle" style={subStyle}>/topapi/.../employee/list</text>

        <rect x="1090" y="520" width="300" height="80" rx="10" />
        <text x="1240" y="560" textAnchor="middle" style={titleStyle}>用戶詳情：user/get</text>
        <text x="1240" y="584" textAnchor="middle" style={subStyle}>/topapi/v2/user/get</text>

        {/* 合併與落地 */}
        <rect x="260" y="700" width="360" height="80" rx="10" />
        <text x="440" y="742" textAnchor="middle" style={smallTitleStyle}>合併去重與字段補齊</text>

        <rect x="660" y="700" width="360" height="80" rx="10" />
        <text x="840" y="742" textAnchor="middle" style={smallTitleStyle}>ETL 解析並寫入 SQLite</text>

        <rect x="1060" y="700" width="360" height="80" rx="10" />
        <text x="1240" y="742" textAnchor="middle" style={smallTitleStyle}>同步到 Apollo（模擬導入）</text>
      </g>

      {/* 連線群組已提前繪製（避免覆蓋節點） */}
      <g />

      {/* 連線標註文字（置於節點上層，確保清晰） */}
      <g fontSize="12">
        <text x="400" y="150" style={subStyle}>access_token</text>
        <text x="720" y="320" style={subStyle}>userId</text>
        <text x="740" y="500" style={subStyle}>userid_list (≤100)</text>
        <text x="470" y="645" style={subStyle}>field_data_list</text>
        <text x="860" y="665" style={subStyle}>sys00 / dept_id</text>
      </g>
    </svg>
  );
}

export default function Docs({ onNavigate }) {
  useEffect(() => {
    document.title = 'API 說明 | DingTalk-Apollo POC';
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>API 說明文件</Title>
        <Space>
          <Button onClick={() => onNavigate && onNavigate('poc')}>返回 POC 測試</Button>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>整體流程</Title>
          <Paragraph>下圖展示本 POC 由前端觸發到最終導入的完整資料流：</Paragraph>
          <FlowSvg />
          <Alert style={{ marginTop: 12 }} type="info" showIcon message="重點" description={<>
            <div>• 批量以 <Text code>userid</Text> 分片（最多 100/批），並行拉取花名冊字段。</div>
            <div>• 若 v2 花名冊缺少關鍵字段（如部門/入職日期），會回退舊版花名冊或 <Text code>user/get</Text> 補齊。</div>
            <div>• 透過指數回退重試，避免限流造成失敗。</div>
          </>} />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>認證（Access Token）</Title>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="方法">POST</Descriptions.Item>
            <Descriptions.Item label="URL">api.dingtalk.com/v1.0/oauth2/{'{corpId}'}/token</Descriptions.Item>
            <Descriptions.Item label="Body">client_id, client_secret, grant_type=client_credentials</Descriptions.Item>
            <Descriptions.Item label="回應">access_token, expires_in</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 8 }}>
            後端自動管理 Token 快取與續期（過期前 5 分鐘刷新）。
          </Paragraph>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>人員 ID 拉取</Title>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="在職">POST oapi.dingtalk.com/topapi/smartwork/hrm/employee/queryonjob</Descriptions.Item>
            <Descriptions.Item label="待入職">POST oapi.dingtalk.com/topapi/smartwork/hrm/employee/querypreentry</Descriptions.Item>
            <Descriptions.Item label="離職">GET api.dingtalk.com/v1.0/hrm/employees/dismissions</Descriptions.Item>
          </Descriptions>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>以上接口皆支援分頁；POC 會累積所有 userid，之後再批量獲取花名冊字段。</Paragraph>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>花名冊字段（批量）</Title>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="方法">POST</Descriptions.Item>
            <Descriptions.Item label="URL">oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list</Descriptions.Item>
            <Descriptions.Item label="Body 參數">userid_list（最多100）; field_filter_list（可選，最多100；未傳則取全部）; agentid</Descriptions.Item>
            <Descriptions.Item label="重點字段">姓名、手機、郵箱、主部門ID/名稱、職位/職級、入職日期</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 8 }}>
            - 入職日期：可從 <Text code>sys01-hiredDate</Text>、<Text code>sys01-entryTime</Text>，或按字段名「入職日期/入職時間」取得，並格式化為 YYYY-MM-DD。<br />
            - 部門：前端顯示部門 ID/編碼；名稱若存在會一併保存於後端。
          </Paragraph>
          <Alert style={{ marginTop: 8 }} type="success" showIcon message={<>
            <div>POC 會自動：分片（userid 與字段）、控制並發、錯誤重試、結果合併。</div>
          </>} />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>缺失字段補齊</Title>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="舊版花名冊（回退）">POST oapi.dingtalk.com/topapi/smartwork/hrm/employee/list</Descriptions.Item>
            <Descriptions.Item label="用戶詳情（回退）">POST oapi.dingtalk.com/topapi/v2/user/get</Descriptions.Item>
          </Descriptions>
          <Paragraph style={{ marginTop: 8 }}>
            當 v2 花名冊缺少關鍵字段（如主部門名稱/入職日期），會回退舊版花名冊拉取 <Text code>sys00-*</Text> 字段；若仍缺主部門ID，則回退 <Text code>user/get</Text> 取 <Text code>dept_id_list[0]</Text>。
          </Paragraph>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>調用示例（cURL）</Title>
          <Paragraph>取得 Token：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`curl -X POST \\
  'https://api.dingtalk.com/v1.0/oauth2/{corpId}/token' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "client_id": "<CLIENT_ID>",
  "client_secret": "<CLIENT_SECRET>",
  "grant_type": "client_credentials"
}'`}
          </pre>
          <Paragraph style={{ marginTop: 12 }}>待入職人員 ID：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`curl -X POST \\
  'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/querypreentry?access_token=<ACCESS_TOKEN>' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "offset": 0,
  "size": 50
}'`}
          </pre>
          <Paragraph style={{ marginTop: 12 }}>離職人員 ID：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`curl -G \\
  'https://api.dingtalk.com/v1.0/hrm/employees/dismissions' \\
  --data-urlencode 'nextToken=0' \\
  --data-urlencode 'maxResults=50' \\
  -H 'x-acs-dingtalk-access-token: <ACCESS_TOKEN>'`}
          </pre>
          <Paragraph style={{ marginTop: 12 }}>在職人員 ID：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`curl -X POST \\
  'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/queryonjob?access_token=<ACCESS_TOKEN>' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "status_list": "2,3,5,-1",
  "offset": 0,
  "size": 50
}'`}
          </pre>
          <Paragraph style={{ marginTop: 12 }}>批量花名冊字段（v2）：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`curl -X POST \\
  'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list?access_token=<ACCESS_TOKEN>' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "agentid": <AGENT_ID>,
  "userid_list": "user1,user2,user3",
  "field_filter_list": "sys01-name,sys01-mobile,sys01-mainDept,sys01-hiredDate"
}'`}
          </pre>
          <Alert style={{ marginTop: 8 }} type="info" showIcon message="提示" description="agentid 為企業內部應用的 AgentId；不填 field_filter_list 會返回全部可見字段，但 RT 會增加。" />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>範例程式碼（Node.js + axios）</Title>
          <Paragraph>以 Node.js 取得 Token、拉取在職人員 ID、並批量獲取花名冊字段：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`const axios = require('axios');

async function getAccessToken(corpId, clientId, clientSecret) {
  const url = \
    \'https://api.dingtalk.com/v1.0/oauth2/\' + corpId + \'/token\';
  const { data } = await axios.post(url, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  }, { headers: { 'Content-Type': 'application/json' }});
  return data.access_token;
}

async function queryOnJob(accessToken, offset = 0, size = 50) {
  const url = \'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/queryonjob\';
  const { data } = await axios.post(url, {
    status_list: '2,3,5,-1',
    offset,
    size
  }, { params: { access_token: accessToken }});
  if (data.errcode !== 0) throw new Error(data.errmsg);
  return data.result; // { data_list: [userid...], next_cursor }
}

async function queryPreEntry(accessToken, offset = 0, size = 50) {
  const url = \'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/querypreentry\';
  const { data } = await axios.post(url, { offset, size }, { params: { access_token: accessToken }});
  if (data.errcode !== 0) throw new Error(data.errmsg);
  return data.result; // { data_list: [userid...], next_cursor }
}

async function queryDismissions(accessToken, nextToken = 0, maxResults = 50) {
  const url = \'https://api.dingtalk.com/v1.0/hrm/employees/dismissions\';
  const { data, status } = await axios.get(url, {
    params: { nextToken, maxResults },
    headers: { 'x-acs-dingtalk-access-token': accessToken }
  });
  if (status !== 200) throw new Error('HTTP ' + status);
  return data; // { userIdList: [...], hasMore, nextToken }
}

async function getRosterV2(accessToken, userIds, agentid, fieldFilterList) {
  const url = \'https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list\';
  const body = {
    userid_list: userIds.join(','),
    agentid,
    ...(fieldFilterList?.length ? { field_filter_list: fieldFilterList.join(',') } : {})
  };
  const { data } = await axios.post(url, body, {
    params: { access_token: accessToken },
    headers: { 'Content-Type': 'application/json' }
  });
  if (data.errcode !== 0) throw new Error(data.errmsg);
  return data.result; // [{ userid, field_data_list: [...] }]
}

async function main() {
  const corpId = '<CORP_ID>';
  const clientId = '<CLIENT_ID>';
  const clientSecret = '<CLIENT_SECRET>';
  const agentid = 1; // 你的企業內部應用 AgentId
  const accessToken = await getAccessToken(corpId, clientId, clientSecret);

  // 1) 累積所有在職 userid
  let allUserIds = [];
  let offset = 0;
  const size = 50;
  while (true) {
    const res = await queryOnJob(accessToken, offset, size);
    allUserIds = allUserIds.concat(res.data_list || []);
    if (!res.next_cursor) break;
    offset = res.next_cursor;
  }

  // 1.1) 待入職
  offset = 0;
  while (true) {
    const res = await queryPreEntry(accessToken, offset, size);
    allUserIds = allUserIds.concat(res.data_list || []);
    if (!res.next_cursor) break;
    offset = res.next_cursor;
  }

  // 1.2) 離職
  let nextToken = 0;
  while (true) {
    const res = await queryDismissions(accessToken, nextToken, 50);
    allUserIds = allUserIds.concat(res.userIdList || []);
    if (!res.hasMore) break;
    nextToken = res.nextToken;
  }

  // 2) 分批獲取花名冊字段（每批最多100個 userid）
  const chunks = [];
  for (let i = 0; i < allUserIds.length; i += 100) {
    chunks.push(allUserIds.slice(i, i + 100));
  }
  const fieldFilter = ['sys01-name','sys01-mobile','sys01-mainDept','sys01-hiredDate'];
  const roster = [];
  for (const users of chunks) {
    const part = await getRosterV2(accessToken, users, agentid, fieldFilter);
    roster.push(...part);
  }
  console.log('共取得花名冊筆數:', roster.length);
}

main().catch(console.error);`}
          </pre>
          <Alert type="warning" showIcon style={{ marginTop: 8 }} message="注意" description="以上為直連 DingTalk API 的最小可行示例；正式環境請在後端進行呼叫與憑證管理，勿在前端暴露憑證。" />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>範例程式碼（TypeScript 範型）</Title>
          <Paragraph>簡化的型別定義，利於在專案中落地：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`type UserId = string;

interface RosterFieldItem { item_index: number; value?: string | number; label?: string }
interface RosterField { field_code: string; field_name: string; group_id: string; field_value_list: RosterFieldItem[] }
interface RosterEmployee { userid: UserId; field_data_list: RosterField[] }

interface OnJobResult { data_list: UserId[]; next_cursor?: number }
interface PreEntryResult { data_list: UserId[]; next_cursor?: number }
interface DismissionsResult { userIdList: UserId[]; hasMore: boolean; nextToken?: number }

type AccessToken = string;

// Tip: 你的封裝函式可以回傳上述型別，讓編譯期就能檢查字段。
`}
          </pre>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>前端觸發後端同步（axios）</Title>
          <Paragraph>前端不直接呼叫 DingTalk API，而是呼叫後端的同步接口：</Paragraph>
          <pre style={{ background:'#0d1117', color:'#c9d1d9', padding:12, borderRadius:8, overflow:'auto' }}>
{`import axios from 'axios';

async function syncEmployees(corpId, clientId, clientSecret) {
  const { data } = await axios.post('/api/sync-employees', {
    corpId,
    clientId,
    clientSecret
  });
  if (!data.success) throw new Error(data.message);
  return data.data; // { totalProcessed, breakdown, ... }
}
`}
          </pre>
        </Card>

        <Card>
          <Title level={4}>常見限制與最佳實務</Title>
          <ul style={{ paddingLeft: 20 }}>
            <li>QPS 與配額：建議控制並發在 3–5，發生 429 時進行指數回退重試。</li>
            <li>字段可見性：確保應用具有“智能人事個人資訊讀權限”，並且花名冊字段對應用可見。</li>
            <li>字段過濾：若只需少數字段，建議指定 <Text code>field_filter_list</Text> 以降低 RT。</li>
            <li>資料一致性：合併多批字段時，以 <Text code>field_code</Text> 去重，最後寫入資料庫。</li>
          </ul>
        </Card>
      </Content>
    </Layout>
  );
}

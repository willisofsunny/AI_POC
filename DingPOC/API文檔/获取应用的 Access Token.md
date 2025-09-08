## 请求方法


POST /v1.0/oauth2/{corpId}/token HTTP/1.1
Host:api.dingtalk.com
Content-Type:application/json

{
  "client_id" : "ding123",
  "client_secret" : "*******",
  "grant_type" : "client_credentials"
}

## Path参数

| 名称   | 类型   | 是否必填 | 描述                                                                                                                                      |
| ------ | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| corpId | String | 是       | 组织ID，应用运行在哪个组织就填写哪个组织的 corpId：* 企业内部应用：填写本企业 corpId。* 第三方企业应用：填写开通应用的授权企业的 corpId。 |

## Body参数

| 名称          | 类型   | 是否必填 | 描述                           |
| ------------- | ------ | -------- | ------------------------------ |
| client_id     | String | 是       | 应用的 ClientID。              |
| client_secret | String | 是       | 应用的 ClientSecret。          |
| grant_type    | String | 是       | 授权类型：* client_credentials |

## 返回参数

| 名称         | 类型    | 描述                         |
| ------------ | ------- | ---------------------------- |
| access_token | String  | 访问凭证。                   |
| expires_in   | Integer | 访问凭证有效的时长，单位秒。 |

## 示例

**请求示例**HTTP

POST /v1.0/oauth2/ding9f****41/token HTTP/1.1
Host:api.dingtalk.com
Content-Type:application/json

{
  "client_id" : "suite123",
  "client_secret" : "********",
  "grant_type" : "client_credentials"
}


**返回示例**


HTTP/1.1 200 OK
Content-Type:application/json

{
  "access_token" : "2bf******9be361a5084f1e2b8",
  "expires_in" : 7200
}

## 错误码

| HttpCode | 错误码                 | 错误信息               | 说明                                 |
| -------- | ---------------------- | ---------------------- | ------------------------------------ |
| 400      | invalid.client         | invalid.client         | 无效的ClientID或ClientSecret         |
| 400      | unsupported.grant.type | unsupported.grant.type | 不支持此授权类型，请检查授权类型参数 |
| 401      | unauthorized.client    | unauthorized.client    | 应用未被授权                         |
| 500      | server.error           | server.error           | 服务器意外错误                       |

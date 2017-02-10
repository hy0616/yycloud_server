
### 用户
`YourIP 目前为 114.215.149.129:1337`
 
|   URL | HTTP |     功能  |
| :-------- | :--------: | :--: |
| /api/user/signup  | POST |  用户注册   |
| /api/user/login  | POST |  用户登陆   |
| /api/user/sendSmsCode  | POST |  发送手机验证码   |
| /api/user/signUpOrlogInWithPhone  | POST |  手机一键注册或登陆   |
| /api/user/resetPassword  | POST |  用户注册   |

#### 用户注册
|   参数 | 说明 | 
| :-------- | :-------- |
| username  |  必填，可以是汉字、英文等，不能和已有用户名重复   |
| password  | 必填 |  
| email     | 必填,不能和已有用户名重复，注册后会自动向该邮箱发送激活邮件|
| phone  | 必填,不能和已有用户名重复，注册后会向用户手机发送验证码 | 

注册成功返回用户，如
```javascript
{
    "username": "你好",
    "email": "mydearxym2@qq.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImZha2V1c2VyMiIsImlhdCI6MTQyNjEyMTQyMn0.zjfIAAu_1d52Scb4I_uCkZvaiMnIcT6BByWp_T4kq7A"
  
}
说明： 这里返回的token在以后的`每次请求api`(注册和登陆除外)中必须放在 HTTP 的 header 中,否则服务器会直接reject
```
注册失败返回错误码，如
```javascript 
{
    "code": 214,
    "message": "Mobile phone number has already been taken"
}
```
```bash
curl -X POST  -d '{"username":"demouser","password":"demopassword","phone":"15982398615", "email":"xxx@xx.com"}' \
YourIP/user/signup
```

#### 用户登陆
|   参数 | 说明 | 
| :-------- | :-------- |
| username  |  必填，可以是汉字、英文等，不能和已有用户名重复   |
| password  | 必填 |  

登陆成功返回用户，如
```javascript
{
    "username": "fakeuser2",
    "emailVerified": false,
    "mobilePhoneVerified": false,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImZha2V1c2VyMiIsImlhdCI6MTQyNjEyMTY5OX0.ZZcmbHCS9h8N9al4b1ehfnNRVscqubqWxQ48eS9OLLA"
}
说明： 这里返回的token在以后的`每次请求api`(注册和登陆除外)中必须放在 HTTP 的 header 中,否则服务器会直接reject
```
注册失败返回错误码，如
```javascript 
{
    "code": 211,
    "message": "Could not find user"
}
```
```bash
curl -X POST  -d '{"username":"demouser","password":”dmopassword"}' \
YourIP/user/login
```

#### 手机号码一键注册或登陆
> 该过程包含两个步骤: 
> 1: 先向用户手机发送验证码(`/api/user/sendSmsCode`)
> 2: 用户将手机和验证码发送给(`/api/user/signUpOrlogInWithPhone`)
> 说明：如果该手机号码存在，则为登陆，不存在则直接注册,用户名默认为该用户手机号码

##### 步骤1: 发送验证码
|URL |   参数 | 说明 | 
| :-------- | :-------- | :-------- |
| /api/user/sendSmsCode  |  phone   | 请求验证码(10分钟内有效)|


成功返回验证码状态，如
```javascript
{
    "status": "smsCode already send"
}
```
注册失败返回错误码，如
```javascript 
{
    "code": 127,
    "message": "The mobile phone number was invalid."
}
```
```bash
curl -X POST \
  -d '{"phone:"159xxxxxxxx"}' \
  YourIP/user/sendSmsCode
```

##### 步骤2: 登陆或者注册
|URL |   参数 | 说明 | 
| :-------- | :-------- | :-------- |
| /api/user/signUpOrlogInWithPhone  |  phone，smsCode   | 登陆或者注册 |


成功返回用户信息,并且mobilePhoneVerified会被置为`true`，如
```javascript
{
    "username": "15982398614",
    "emailVerified": false,
    "mobilePhoneVerified": true,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE1OTgyMzk4NjE0IiwiaWF0IjoxNDI2MTIxOTQ4fQ.aCn896y3s7OSecKyP-ANjZ9ckuT5UuZq8LD_0tBTPqg"
}
说明： 这里返回的token在以后的`每次请求api`(注册和登陆除外)中必须放在 HTTP 的 header 中,否则服务器会直接reject
```
失败返回手机号码和验证码，如
```javascript 
{
    "mobilePhoneNumber": "15982398614",
    "smsCode": "298363"
}
```
```bash
curl -X POST \
  -d '{"phone:"159xxxxxxxx", smsCode: 283762}' \
  YourIP/user/signUpOrlogInWithPhone
```

# 出海方案

1. 通过代理访问IP
2. 多个部署后端

## 通过代理访问

### 通过代理访问 Supabase

海外用户优先路线

1. 不需要部署多个后端应用
2. 响应是否可以接受
4. 功能更加完善
5. 数据库直连
6. 免费
7. 命令行支持，开发方便

### 通过代理访问 Memfiredb

国内用户优先路线

1. 国内OAuth对接方便
2. 国内用户响应更快

## 部署多个后端

访问速度快

1. 需要同时维护 memfiredb 和 supabase
2. 需要支付双份成本
3. 需要同时维护自建的后端服务
4. 需要同时维护

## 自建Supababse集群

目前暂时不需要，如果业务上能成功，再自建 Supabase 集群也不迟。

# 性能压测

## From Aliyun

[root@iZ2ze2w0ld7nllx7ofn7yfZ ~]# wrk -t3 --latency -d60s 'https://joincyfzsuvolyklirho.supabase.co/rest/v1/example?select=id' \
> -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE" \
> -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE"
Running 1m test @ https://joincyfzsuvolyklirho.supabase.co/rest/v1/example?select=id
  3 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   346.04ms   68.84ms   1.07s    94.10%
    Req/Sec     9.20      4.33    30.00     68.10%
  Latency Distribution
     50%  334.70ms
     75%  357.98ms
     90%  378.82ms
     99%  615.92ms
  1553 requests in 1.00m, 0.91MB read
Requests/sec:     25.88
Transfer/sec:     15.57KB

## From Work Compoter

➜  Workspace wrk -t3 --latency -d60s 'https://joincyfzsuvolyklirho.supabase.co/rest/v1/example?select=id' \
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW5jeWZ6c3V2b2x5a2xpcmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODc2MjMsImV4cCI6MjA1NjU2MzYyM30.1MOumBy-Hatxd25iynOUJh2ggIWdZMEzQeUfzV1fsZE"
Running 1m test @ https://joincyfzsuvolyklirho.supabase.co/rest/v1/example?select=id
  3 threads and 10 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   400.96ms  208.36ms   1.58s    91.77%
    Req/Sec     8.46      4.84    20.00     76.44%
  Latency Distribution
     50%  336.48ms
     75%  369.50ms
     90%  558.75ms
     99%    1.36s
  1250 requests in 1.00m, 751.96KB read
  Socket errors: connect 0, read 0, write 0, timeout 19
Requests/sec:     20.81
Transfer/sec:     12.52KB
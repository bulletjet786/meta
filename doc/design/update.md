# 自动更新方案设计

## 设计目标

1. 可以灵活调整更新方案
2. 可以方便的进行扩展 
3. 将来可以基于用户ID可以去做渠道/灰度
4. 要可以方便的完成更新操作

## L1: 支持自动更新

使用 腾讯云+CDN 的存储
使用域名：https://dl.deckz.fun/

目录规划（bucket download）：
存储二进制和安装包资源

/crystal 存放crystal资源
/public 存放公共资源

Url规划：
ApiUrl: https://joincyfzsuvolyklirho.supabase.co/functions/v1/version/latest

## L2: 迁移到自动更新的API

## L3: 迁移到

## L4:



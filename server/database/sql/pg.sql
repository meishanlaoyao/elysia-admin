/*
PostgreSQL Backup
Database: elysia-admin/public
Backup Time: 2026-04-18 16:27:28
*/

DROP SEQUENCE IF EXISTS "public"."business_merchant_id_seq";
DROP SEQUENCE IF EXISTS "public"."business_orders_id_seq";
DROP SEQUENCE IF EXISTS "public"."business_payments_id_seq";
DROP SEQUENCE IF EXISTS "public"."business_refund_id_seq";
DROP SEQUENCE IF EXISTS "public"."merchant_payment_configs_id_seq";
DROP SEQUENCE IF EXISTS "public"."monitor_job_job_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_api_api_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_dept_dept_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_dict_data_dict_code_seq";
DROP SEQUENCE IF EXISTS "public"."system_dict_type_dict_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_ip_black_ip_black_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_login_log_log_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_menu_btn_btn_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_menu_menu_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_oper_log_oper_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_role_role_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_storage_storage_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_user_user_id_seq";
DROP TABLE IF EXISTS "public"."business_merchant";
DROP TABLE IF EXISTS "public"."business_merchant_configs";
DROP TABLE IF EXISTS "public"."business_orders";
DROP TABLE IF EXISTS "public"."business_payments";
DROP TABLE IF EXISTS "public"."business_refund";
DROP TABLE IF EXISTS "public"."monitor_job";
DROP TABLE IF EXISTS "public"."system_api";
DROP TABLE IF EXISTS "public"."system_dept";
DROP TABLE IF EXISTS "public"."system_dict_data";
DROP TABLE IF EXISTS "public"."system_dict_type";
DROP TABLE IF EXISTS "public"."system_ip_black";
DROP TABLE IF EXISTS "public"."system_login_log";
DROP TABLE IF EXISTS "public"."system_menu";
DROP TABLE IF EXISTS "public"."system_menu_btn";
DROP TABLE IF EXISTS "public"."system_oper_log";
DROP TABLE IF EXISTS "public"."system_role";
DROP TABLE IF EXISTS "public"."system_role_menu";
DROP TABLE IF EXISTS "public"."system_storage";
DROP TABLE IF EXISTS "public"."system_user";
DROP TABLE IF EXISTS "public"."system_user_role";
CREATE SEQUENCE "business_merchant_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "business_orders_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "business_payments_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "business_refund_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "merchant_payment_configs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "monitor_job_job_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_api_api_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_dept_dept_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_dict_data_dict_code_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_dict_type_dict_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_ip_black_ip_black_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_login_log_log_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_menu_btn_btn_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_menu_menu_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_oper_log_oper_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_role_role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_storage_storage_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE SEQUENCE "system_user_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
CREATE TABLE "business_merchant" (
  "id" int8 NOT NULL DEFAULT nextval('business_merchant_id_seq'::regclass),
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "status" bool DEFAULT true
)
;
ALTER TABLE "business_merchant" OWNER TO "postgres";
CREATE TABLE "business_merchant_configs" (
  "id" int8 NOT NULL DEFAULT nextval('merchant_payment_configs_id_seq'::regclass),
  "merchant_id" int8 NOT NULL,
  "channel" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "app_id" varchar(100) COLLATE "pg_catalog"."default",
  "mch_id" varchar(100) COLLATE "pg_catalog"."default",
  "private_key" text COLLATE "pg_catalog"."default",
  "public_key" text COLLATE "pg_catalog"."default",
  "config" jsonb,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_merchant_configs" OWNER TO "postgres";
CREATE TABLE "business_orders" (
  "id" int8 NOT NULL DEFAULT nextval('business_orders_id_seq'::regclass),
  "order_no" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" int8 NOT NULL,
  "merchant_id" int8 NOT NULL,
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "description" varchar(500) COLLATE "pg_catalog"."default",
  "amount" numeric(10,2) NOT NULL,
  "currency" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'CNY'::character varying,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "expire_time" timestamp(6),
  "payment_method" varchar(20) COLLATE "pg_catalog"."default",
  "extra" jsonb DEFAULT '{}'::jsonb,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_orders" OWNER TO "postgres";
CREATE TABLE "business_payments" (
  "id" int8 NOT NULL DEFAULT nextval('business_payments_id_seq'::regclass),
  "order_id" int8 NOT NULL,
  "merchant_config_id" int8 NOT NULL,
  "payment_no" varchar(64) COLLATE "pg_catalog"."default",
  "channel" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "platform" varchar(20) COLLATE "pg_catalog"."default",
  "amount" numeric(10,2) NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "third_trade_no" varchar(100) COLLATE "pg_catalog"."default",
  "extra" jsonb DEFAULT '{}'::jsonb,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_payments" OWNER TO "postgres";
CREATE TABLE "business_refund" (
  "id" int8 NOT NULL DEFAULT nextval('business_refund_id_seq'::regclass),
  "order_id" int8 NOT NULL,
  "payment_id" int8 NOT NULL,
  "refund_no" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "third_refund_no" varchar(100) COLLATE "pg_catalog"."default",
  "extra" jsonb DEFAULT '{}'::jsonb,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_refund" OWNER TO "postgres";
CREATE TABLE "monitor_job" (
  "job_id" int8 NOT NULL DEFAULT nextval('monitor_job_job_id_seq'::regclass),
  "job_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "job_cron" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "job_args" varchar(256) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "monitor_job" OWNER TO "postgres";
CREATE TABLE "system_api" (
  "api_id" int8 NOT NULL DEFAULT nextval('system_api_api_id_seq'::regclass),
  "api_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "api_path" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "api_method" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_api" OWNER TO "postgres";
CREATE TABLE "system_dept" (
  "dept_id" int8 NOT NULL DEFAULT nextval('system_dept_dept_id_seq'::regclass),
  "dept_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "parent_id" int8,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "sort" int4 DEFAULT 0
)
;
ALTER TABLE "system_dept" OWNER TO "postgres";
CREATE TABLE "system_dict_data" (
  "dict_code" int8 NOT NULL DEFAULT nextval('system_dict_data_dict_code_seq'::regclass),
  "dict_sort" int4 NOT NULL DEFAULT 0,
  "dict_value" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "dict_label" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "dict_type" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "tag_type" varchar(64) COLLATE "pg_catalog"."default",
  "custom_class" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_dict_data" OWNER TO "postgres";
CREATE TABLE "system_dict_type" (
  "dict_id" int8 NOT NULL DEFAULT nextval('system_dict_type_dict_id_seq'::regclass),
  "dict_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "dict_type" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_dict_type" OWNER TO "postgres";
CREATE TABLE "system_ip_black" (
  "ip_black_id" int8 NOT NULL DEFAULT nextval('system_ip_black_ip_black_id_seq'::regclass),
  "ip_address" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_ip_black" OWNER TO "postgres";
CREATE TABLE "system_login_log" (
  "log_id" int8 NOT NULL DEFAULT nextval('system_login_log_log_id_seq'::regclass),
  "login_type" varchar(32) COLLATE "pg_catalog"."default",
  "client_type" varchar(32) COLLATE "pg_catalog"."default",
  "client_platform" varchar(32) COLLATE "pg_catalog"."default",
  "ipaddr" varchar(128) COLLATE "pg_catalog"."default",
  "login_location" varchar(256) COLLATE "pg_catalog"."default",
  "user_agent" varchar(512) COLLATE "pg_catalog"."default",
  "os" varchar(64) COLLATE "pg_catalog"."default",
  "message" varchar(255) COLLATE "pg_catalog"."default",
  "status" bool,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "login_name" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_login_log" OWNER TO "postgres";
CREATE TABLE "system_menu" (
  "menu_id" int8 NOT NULL DEFAULT nextval('system_menu_menu_id_seq'::regclass),
  "path" varchar(255) COLLATE "pg_catalog"."default",
  "name" varchar(64) COLLATE "pg_catalog"."default",
  "component" varchar(255) COLLATE "pg_catalog"."default",
  "title" varchar(64) COLLATE "pg_catalog"."default",
  "icon" varchar(64) COLLATE "pg_catalog"."default",
  "show_badge" bool DEFAULT false,
  "show_text_badge" varchar(64) COLLATE "pg_catalog"."default",
  "is_hide" bool DEFAULT false,
  "is_hide_tab" bool DEFAULT false,
  "link" varchar(255) COLLATE "pg_catalog"."default",
  "is_iframe" bool DEFAULT false,
  "keep_alive" bool DEFAULT true,
  "fixed_tab" bool DEFAULT false,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "active_path" varchar(255) COLLATE "pg_catalog"."default",
  "sort" int4 DEFAULT 0,
  "parent_id" int8,
  "status" bool DEFAULT true,
  "is_full_page" bool DEFAULT false
)
;
ALTER TABLE "system_menu" OWNER TO "postgres";
CREATE TABLE "system_menu_btn" (
  "menu_id" int8,
  "sort" int4 DEFAULT 0,
  "title" varchar(64) COLLATE "pg_catalog"."default",
  "permission" varchar(64) COLLATE "pg_catalog"."default",
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "btn_id" int8 NOT NULL DEFAULT nextval('system_menu_btn_btn_id_seq'::regclass),
  "status" bool DEFAULT true
)
;
ALTER TABLE "system_menu_btn" OWNER TO "postgres";
CREATE TABLE "system_oper_log" (
  "oper_id" int8 NOT NULL DEFAULT nextval('system_oper_log_oper_id_seq'::regclass),
  "title" varchar(255) COLLATE "pg_catalog"."default",
  "request_method" varchar(10) COLLATE "pg_catalog"."default",
  "operator_type" varchar(32) COLLATE "pg_catalog"."default",
  "user_id" int8,
  "oper_url" varchar(256) COLLATE "pg_catalog"."default",
  "oper_ip" varchar(128) COLLATE "pg_catalog"."default",
  "oper_location" varchar(256) COLLATE "pg_catalog"."default",
  "oper_param" varchar(1024) COLLATE "pg_catalog"."default",
  "json_result" varchar(1024) COLLATE "pg_catalog"."default",
  "cost_time" int4,
  "status" bool,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "action" varchar(255) COLLATE "pg_catalog"."default",
  "oper_name" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_oper_log" OWNER TO "postgres";
CREATE TABLE "system_role" (
  "role_id" int8 NOT NULL DEFAULT nextval('system_role_role_id_seq'::regclass),
  "role_name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "role_code" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "sort" int4 DEFAULT 0,
  "status" bool DEFAULT true,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_role" OWNER TO "postgres";
CREATE TABLE "system_role_menu" (
  "role_id" int8,
  "menu_id" int8,
  "menu_btn_id" int8
)
;
ALTER TABLE "system_role_menu" OWNER TO "postgres";
CREATE TABLE "system_storage" (
  "storage_id" int8 NOT NULL DEFAULT nextval('system_storage_storage_id_seq'::regclass),
  "name" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "endpoint" varchar(255) COLLATE "pg_catalog"."default",
  "bucket" varchar(128) COLLATE "pg_catalog"."default",
  "access_key" varchar(128) COLLATE "pg_catalog"."default",
  "secret_key" varchar(128) COLLATE "pg_catalog"."default",
  "status" bool DEFAULT false,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "region" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_storage" OWNER TO "postgres";
CREATE TABLE "system_user" (
  "user_id" int8 NOT NULL DEFAULT nextval('system_user_user_id_seq'::regclass),
  "username" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" varchar(64) COLLATE "pg_catalog"."default",
  "email" varchar(64) COLLATE "pg_catalog"."default",
  "phone" varchar(11) COLLATE "pg_catalog"."default",
  "sex" varchar(1) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "avatar" varchar(255) COLLATE "pg_catalog"."default",
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" int8,
  "update_time" timestamptz(6),
  "update_by" int8,
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "status" bool DEFAULT true,
  "dept_id" int8
)
;
ALTER TABLE "system_user" OWNER TO "postgres";
CREATE TABLE "system_user_role" (
  "role_id" int8,
  "user_id" int8
)
;
ALTER TABLE "system_user_role" OWNER TO "postgres";
BEGIN;
LOCK TABLE "public"."business_merchant" IN SHARE MODE;
DELETE FROM "public"."business_merchant";
INSERT INTO "public"."business_merchant" ("id","name","create_time","create_by","update_time","update_by","del_flag","remark","status") VALUES (6, '梅山老妖', '2026-03-31 02:27:18.421+00', 1, '2026-03-31 07:41:35.938+00', 1, 'f', '', 't')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_merchant_configs" IN SHARE MODE;
DELETE FROM "public"."business_merchant_configs";
INSERT INTO "public"."business_merchant_configs" ("id","merchant_id","channel","app_id","mch_id","private_key","public_key","config","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (2, 6, 'wechat', NULL, NULL, NULL, NULL, NULL, 't', '2026-03-31 06:29:22.418176+00', 1, NULL, NULL, 'f', ''),(3, 6, 'paypal', NULL, NULL, NULL, NULL, NULL, 't', '2026-03-31 06:29:26.17941+00', 1, NULL, NULL, 'f', ''),(1, 6, 'alipay', '', NULL, '', '', NULL, 't', '2026-03-31 05:39:10.715+00', 1, '2026-03-31 07:25:27.485+00', 1, 'f', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_orders" IN SHARE MODE;
DELETE FROM "public"."business_orders";
INSERT INTO "public"."business_orders" ("id","order_no","user_id","merchant_id","title","description","amount","currency","status","expire_time","payment_method","extra","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (13, '019d470fdf947000a42d2b90f17fcacb', 1, 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 12899.00, 'CNY', '0', '2026-04-01 03:37:55.86', 'alipay', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "product": {"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, "marketing": {"couponId": null, "discountAmount": 0}}', '2026-04-01 03:21:55.861585+00', 1, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_payments" IN SHARE MODE;
DELETE FROM "public"."business_payments";
COMMIT;
BEGIN;
LOCK TABLE "public"."business_refund" IN SHARE MODE;
DELETE FROM "public"."business_refund";
COMMIT;
BEGIN;
LOCK TABLE "public"."monitor_job" IN SHARE MODE;
DELETE FROM "public"."monitor_job";
INSERT INTO "public"."monitor_job" ("job_id","job_name","job_cron","status","create_time","create_by","update_time","update_by","del_flag","remark","job_args") VALUES (8, '测试任务', '0 * * * * *', 't', '2026-02-10 02:17:20.145+00', NULL, '2026-04-14 09:37:18.209+00', 1, 'f', '', '["乔治",19,true]')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_api" IN SHARE MODE;
DELETE FROM "public"."system_api";
INSERT INTO "public"."system_api" ("api_id","api_name","api_path","api_method","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (240, '认证模块-web账号密码登录', '/api/auth/login', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(241, '认证模块-刷新令牌', '/api/auth/refresh', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(242, '认证模块-注册用户', '/api/auth/register', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(243, '认证模块-忘记密码', '/api/auth/forget', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(244, '认证模块-重置密码', '/api/auth/reset-password', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(245, '系统字典-查询所有-缓存数据', '/api/system/dict/data/all', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(246, '认证模块-退出登录', '/api/auth/logout', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(247, '缓存列表-查询类型', '/api/monitor/cache/type', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(248, '缓存列表-查询列表', '/api/monitor/cache/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(249, '缓存列表-查询详情', '/api/monitor/cache/key', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(250, '缓存列表-更新指定缓存', '/api/monitor/cache/update-key', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(251, '缓存列表-清除指定类型', '/api/monitor/cache/clear-type', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(252, '缓存列表-清除指定缓存', '/api/monitor/cache/clear-key', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(253, '定时任务-创建', '/api/monitor/job', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(254, '定时任务-查询列表', '/api/monitor/job/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(255, '定时任务-更新', '/api/monitor/job', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(256, '定时任务-删除', '/api/monitor/job/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(257, '在线用户-查询列表', '/api/monitor/online/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(258, '在线用户-强退', '/api/monitor/online/forceLogout/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(259, '系统API-创建', '/api/system/api', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(260, '系统API-查询列表', '/api/system/api/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(261, '系统API-查询详情', '/api/system/api/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(262, '系统API-更新', '/api/system/api', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(263, '系统API-删除', '/api/system/api/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(264, '系统部门-创建', '/api/system/dept', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(265, '系统部门-查询部门树', '/api/system/dept/tree', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(266, '系统部门-下拉选项数据', '/api/system/dept/options', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(267, '系统部门-更新', '/api/system/dept', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(268, '系统部门-删除', '/api/system/dept/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(269, '系统字典-创建-类型', '/api/system/dict/type', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(270, '系统字典-查询所有-缓存类型', '/api/system/dict/type/all', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(271, '系统字典-查询列表-类型', '/api/system/dict/type/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(272, '系统字典-查询详情-类型', '/api/system/dict/type/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(273, '系统字典-更新-类型', '/api/system/dict/type', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(274, '系统字典-删除-类型', '/api/system/dict/type/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(275, '系统字典-创建-数据', '/api/system/dict/data', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(276, '系统字典-查询列表-数据', '/api/system/dict/data/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(277, '系统字典-更新-数据', '/api/system/dict/data', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(278, '系统字典-删除-数据', '/api/system/dict/data/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(279, '黑名单IP-创建', '/api/system/ip-black', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(280, '黑名单IP-查询全部', '/api/system/ip-black/all', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(281, '黑名单IP-更新', '/api/system/ip-black', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(282, '黑名单IP-删除', '/api/system/ip-black/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(283, '登录日志-查询列表', '/api/system/login-log/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(284, '登录日志-删除', '/api/system/login-log/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(285, '系统菜单-创建菜单', '/api/system/menu', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(286, '系统菜单-查询用户菜单树', '/api/system/menu/simple', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(287, '系统菜单-查询完整菜单树', '/api/system/menu/tree', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(288, '系统菜单-查询菜单详情', '/api/system/menu/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(289, '系统菜单-更新菜单', '/api/system/menu', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(290, '系统菜单-删除菜单', '/api/system/menu/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(291, '系统菜单-创建按钮', '/api/system/menu/btn', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(292, '系统菜单-更新按钮', '/api/system/menu/btn', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(293, '系统菜单-删除按钮', '/api/system/menu/btn/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(294, '操作日志-查询列表', '/api/system/oper-log/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(295, '操作日志-删除', '/api/system/oper-log/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(296, '系统角色-创建', '/api/system/role', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(297, '系统角色-查询列表', '/api/system/role/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(298, '系统角色-下拉选项数据', '/api/system/role/options', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(299, '系统角色-查询角色权限', '/api/system/role/permission/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(300, '系统角色-查询详情', '/api/system/role/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(301, '系统角色-更新', '/api/system/role', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(302, '系统角色-更新角色权限', '/api/system/role/permission', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(303, '系统角色-删除', '/api/system/role/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(304, '存储配置-创建', '/api/system/storage', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(305, '存储配置-查询列表', '/api/system/storage/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(306, '存储配置-生成预签名URL', '/api/system/storage/presign', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(307, '存储配置-更新', '/api/system/storage', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(308, '存储配置-删除', '/api/system/storage/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(309, '系统用户-创建', '/api/system/user', '2', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(310, '系统用户-查询列表', '/api/system/user/list', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(311, '系统用户-查询个人基本权限', '/api/system/user/perm', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(312, '系统用户-查询个人基本信息', '/api/system/user/basic', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(313, '系统用户-查询详情', '/api/system/user/:id', '1', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(314, '系统用户-更新', '/api/system/user', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(315, '系统用户-更新个人基本信息', '/api/system/user/basic', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(316, '系统用户-更新个人密码', '/api/system/user/password', '3', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(317, '系统用户-删除', '/api/system/user/:ids', '4', 't', '2026-03-23 00:41:52.123507+00', NULL, NULL, NULL, 'f', NULL),(318, '商户模块-创建', '/api/business/merchant', '2', 't', '2026-03-24 05:21:26.098323+00', NULL, NULL, NULL, 'f', NULL),(319, '商户模块-更新', '/api/business/merchant', '3', 't', '2026-03-24 07:27:53.669827+00', NULL, NULL, NULL, 'f', NULL),(320, '商户模块-删除', '/api/business/merchant/:ids', '4', 't', '2026-03-24 07:50:20.502403+00', NULL, NULL, NULL, 'f', NULL),(321, '商户模块-查询列表', '/api/business/merchant/list', '1', 't', '2026-03-25 01:23:03.865991+00', NULL, NULL, NULL, 'f', NULL),(322, '商户模块-创建商户配置', '/api/business/merchant/config', '2', 't', '2026-03-31 02:34:35.545574+00', NULL, NULL, NULL, 'f', NULL),(323, '商户模块-更新商户配置', '/api/business/merchant/config', '3', 't', '2026-03-31 03:11:27.0473+00', NULL, NULL, NULL, 'f', NULL),(324, '商户模块-查询商户配置', '/api/business/merchant/config/:id', '1', 't', '2026-03-31 03:14:30.971393+00', NULL, NULL, NULL, 'f', NULL),(325, '商户模块-删除商户配置', '/api/business/merchant/config/:ids', '4', 't', '2026-03-31 03:17:42.1914+00', NULL, NULL, NULL, 'f', NULL),(326, '订单模块-创建', '/api/business/orders', '2', 't', '2026-03-31 08:11:06.967318+00', NULL, NULL, NULL, 'f', NULL),(327, '订单模块-查询列表', '/api/business/orders/list', '1', 't', '2026-03-31 09:29:28.806282+00', NULL, NULL, NULL, 'f', NULL),(328, '订单模块-查询详情', '/api/business/orders/:id', '1', 't', '2026-04-01 01:02:08.555638+00', NULL, NULL, NULL, 'f', NULL),(329, '订单模块-更新', '/api/business/orders', '3', 't', '2026-04-01 01:03:54.960617+00', NULL, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dept" IN SHARE MODE;
DELETE FROM "public"."system_dept";
INSERT INTO "public"."system_dept" ("dept_id","dept_name","status","parent_id","create_time","create_by","update_time","update_by","del_flag","remark","sort") VALUES (1, 'Elysia-Admin科技', 't', 0, '2025-12-31 05:30:19.896242+00', NULL, NULL, NULL, 'f', NULL, 0),(2, '长沙总公司', 't', 1, '2025-12-31 05:38:35.375031+00', NULL, NULL, NULL, 'f', NULL, 0),(3, '杭州分公司', 't', 1, '2025-12-31 05:38:44.9+00', NULL, '2025-12-31 09:23:34.735+00', NULL, 'f', '', 0),(4, '研发部门', 't', 2, '2025-12-31 09:27:56.164569+00', NULL, NULL, NULL, 'f', NULL, 0),(5, '市场部门', 't', 2, '2026-01-06 07:57:35.255585+00', NULL, NULL, NULL, 'f', NULL, 0),(6, '测试部门', 't', 2, '2026-01-06 07:58:01.206845+00', NULL, NULL, NULL, 'f', NULL, 0),(7, '财务部门', 't', 2, '2026-01-06 07:58:15.84004+00', NULL, NULL, NULL, 'f', NULL, 0),(8, '运维部门', 't', 2, '2026-01-06 07:58:24.001631+00', NULL, '2026-01-06 08:03:57.027+00', NULL, 'f', NULL, 0),(9, '测试公司', 't', 1, '2026-04-18 01:37:38.993102+00', 1, NULL, NULL, 'f', '', 0)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_data" IN SHARE MODE;
DELETE FROM "public"."system_dict_data";
INSERT INTO "public"."system_dict_data" ("dict_code","dict_sort","dict_value","dict_label","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark","tag_type","custom_class") VALUES (1, 0, '0', '未知', 'system_user_sex', 't', '2025-12-15 07:26:11.870532+00', NULL, NULL, NULL, 'f', NULL, NULL, NULL),(2, 1, '1', '男', 'system_user_sex', 't', '2025-12-15 07:26:20.125+00', NULL, '2025-12-22 07:06:06.339+00', NULL, 'f', NULL, NULL, NULL),(3, 2, '2', '女', 'system_user_sex', 't', '2025-12-15 07:26:26.649+00', NULL, '2025-12-22 07:06:10.191+00', NULL, 'f', NULL, NULL, NULL),(4, 0, '0', '系统通知', 'system_notice_type', 't', '2025-12-22 06:18:34.393991+00', NULL, '2025-12-22 07:42:26.789+00', NULL, 'f', NULL, NULL, NULL),(8, 0, '4', 'DELETE', 'api_request_method', 't', '2025-12-24 07:44:27.425+00', NULL, '2025-12-29 03:00:48.842+00', NULL, 'f', '', 'danger', ''),(7, 0, '3', 'PUT', 'api_request_method', 't', '2025-12-24 07:44:18.668+00', NULL, '2025-12-29 03:01:00.962+00', NULL, 'f', '', 'warning', ''),(5, 0, '2', 'POST', 'api_request_method', 't', '2025-12-24 07:43:57.346+00', NULL, '2026-02-05 05:42:09.755+00', NULL, 'f', '', 'success', ''),(6, 0, '1', 'GET', 'api_request_method', 't', '2025-12-24 07:44:11.389+00', NULL, '2026-02-05 05:42:15.357+00', NULL, 'f', '', 'info', ''),(9, 0, 'admin', '管理员', 'system_user_type', 't', '2026-02-09 07:03:37.970308+00', NULL, NULL, NULL, 'f', '', 'danger', ''),(10, 0, 'user', '普通用户', 'system_user_type', 't', '2026-02-09 07:03:57.351573+00', NULL, NULL, NULL, 'f', '', 'info', ''),(18, 0, 'pc', 'PC', 'system_pay_platform', 't', '2026-03-27 01:39:08.742391+00', 1, NULL, NULL, 'f', '', 'primary', ''),(19, 0, 'h5', 'H5', 'system_pay_platform', 't', '2026-03-27 01:39:28.013588+00', 1, NULL, NULL, 'f', '', 'warning', ''),(20, 0, 'app', 'APP', 'system_pay_platform', 't', '2026-03-27 01:39:47.052235+00', 1, NULL, NULL, 'f', '', 'info', ''),(21, 0, 'mini', '小程序', 'system_pay_platform', 't', '2026-03-27 01:40:08.034721+00', 1, NULL, NULL, 'f', '', 'success', ''),(22, 0, '0', '待支付', 'system_pay_status', 't', '2026-03-27 01:51:08.357+00', 1, '2026-03-27 02:04:47.675+00', 1, 'f', '', 'info', ''),(23, 0, '1', '成功', 'system_pay_status', 't', '2026-03-27 01:51:20.684+00', 1, '2026-03-27 02:04:53.352+00', 1, 'f', '', 'success', ''),(24, 0, '2', '失败', 'system_pay_status', 't', '2026-03-27 01:52:29.779+00', 1, '2026-03-27 02:04:56.268+00', 1, 'f', '', 'danger', ''),(26, 0, '0', '退款中', 'system_refund_status', 't', '2026-03-27 02:08:08.284001+00', 1, NULL, NULL, 'f', '', 'info', ''),(27, 0, '1', '成功', 'system_refund_status', 't', '2026-03-27 02:08:57.338089+00', 1, NULL, NULL, 'f', '', 'success', ''),(28, 0, '2', '失败', 'system_refund_status', 't', '2026-03-27 02:09:06.075658+00', 1, '2026-03-27 02:15:50.106+00', 1, 'f', '', 'danger', ''),(29, 0, 'alipay', '支付宝', 'system_pay_method', 't', '2026-03-31 01:22:12.03037+00', 1, '2026-03-31 06:35:36.634+00', 1, 'f', 'ri:alipay-fill', '', 'text-2xl text-blue-600'),(30, 1, 'wechat', '微信支付', 'system_pay_method', 't', '2026-03-31 01:22:44.8649+00', 1, '2026-03-31 07:27:19.672+00', 1, 'f', 'mingcute:wechat-pay-fill', '', 'text-2xl text-green-600'),(31, 2, 'paypal', 'PayPal', 'system_pay_method', 't', '2026-03-31 01:23:34.30506+00', 1, '2026-03-31 07:27:22.768+00', 1, 'f', 'logos:paypal', '', 'text-2xl'),(14, 0, '0', '待支付', 'system_orders_status', 't', '2026-03-25 02:24:50.104892+00', 1, '2026-04-09 03:03:02.517+00', 1, 'f', '', 'primary', ''),(15, 1, '1', '已支付', 'system_orders_status', 't', '2026-03-25 02:25:04.34673+00', 1, '2026-04-09 03:03:27.915+00', 1, 'f', '', 'success', ''),(16, 2, '2', '已取消', 'system_orders_status', 't', '2026-03-25 02:25:17.546746+00', 1, '2026-04-09 03:03:32.613+00', 1, 'f', '', 'warning', ''),(17, 3, '3', '已过期', 'system_orders_status', 't', '2026-03-25 02:25:28.405897+00', 1, '2026-04-09 03:03:47.283+00', 1, 'f', '', 'info', ''),(32, 4, '4', '已退款', 'system_orders_status', 't', '2026-04-09 03:04:02.205506+00', 1, NULL, NULL, 'f', '', 'danger', ''),(25, 0, '3', '已关闭', 'system_pay_status', 't', '2026-03-27 01:52:41.928+00', 1, '2026-04-09 03:05:00.534+00', 1, 'f', '', 'warning', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_type" IN SHARE MODE;
DELETE FROM "public"."system_dict_type";
INSERT INTO "public"."system_dict_type" ("dict_id","dict_name","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (1, '用户性别', 'system_user_sex', 't', '2025-12-15 07:22:45.589436+00', NULL, NULL, NULL, 'f', NULL),(2, '通知类型', 'system_notice_type', 't', '2025-12-22 06:12:58.98+00', NULL, '2025-12-22 07:04:21.064+00', NULL, 'f', NULL),(3, 'API请求方法', 'api_request_method', 't', '2025-12-24 07:40:36.046+00', NULL, '2026-01-07 03:19:12.302+00', NULL, 'f', NULL),(4, '系统用户类型', 'system_user_type', 't', '2026-02-09 07:02:58.958448+00', NULL, NULL, NULL, 'f', NULL),(6, '订单状态', 'system_orders_status', 't', '2026-03-25 02:24:21.477809+00', 1, NULL, NULL, 'f', NULL),(7, '支付平台', 'system_pay_platform', 't', '2026-03-27 01:38:19.136885+00', 1, NULL, NULL, 'f', NULL),(8, '支付状态', 'system_pay_status', 't', '2026-03-27 01:49:24.074547+00', 1, NULL, NULL, 'f', NULL),(9, '退款状态', 'system_refund_status', 't', '2026-03-27 02:04:14.939754+00', 1, NULL, NULL, 'f', NULL),(10, '支付类型', 'system_pay_method', 't', '2026-03-31 01:19:43.218103+00', 1, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_ip_black" IN SHARE MODE;
DELETE FROM "public"."system_ip_black";
INSERT INTO "public"."system_ip_black" ("ip_black_id","ip_address","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (6, '192.168.2.3', 't', '2026-01-24 07:45:47.878+00', NULL, '2026-03-30 01:52:30.745+00', 1, 'f', '测试黑名单功能')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_login_log" IN SHARE MODE;
DELETE FROM "public"."system_login_log";
INSERT INTO "public"."system_login_log" ("log_id","login_type","client_type","client_platform","ipaddr","login_location","user_agent","os","message","status","create_time","create_by","update_time","update_by","del_flag","remark","login_name") VALUES (190, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-11 03:08:15.412106+00', 1, NULL, NULL, 'f', NULL, 'admin'),(191, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-14 01:35:40.562436+00', 1, NULL, NULL, 'f', NULL, 'admin'),(192, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-14 02:05:02.472273+00', 1, NULL, NULL, 'f', NULL, 'admin'),(193, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-14 02:05:45.402643+00', 1, NULL, NULL, 'f', NULL, 'admin'),(194, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-14 02:14:40.578726+00', 1, NULL, NULL, 'f', NULL, 'admin'),(195, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-15 03:17:40.692411+00', 1, NULL, NULL, 'f', NULL, 'admin'),(196, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-16 06:05:52.148885+00', 1, NULL, NULL, 'f', NULL, 'admin'),(197, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-16 06:11:46.460256+00', 1, NULL, NULL, 'f', NULL, 'admin'),(198, 'admin', 'web', 'chrome', '127.0.0.1', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-04-18 01:33:50.207426+00', 1, NULL, NULL, 'f', NULL, 'admin')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu" IN SHARE MODE;
DELETE FROM "public"."system_menu";
INSERT INTO "public"."system_menu" ("menu_id","path","name","component","title","icon","show_badge","show_text_badge","is_hide","is_hide_tab","link","is_iframe","keep_alive","fixed_tab","create_time","create_by","update_time","update_by","del_flag","remark","active_path","sort","parent_id","status","is_full_page") VALUES (1, '/dashboard', 'Dashboard', '/index/index', 'menus.dashboard.title', 'ri:pie-chart-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:44:03.266366+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(2, 'console', 'Console', '/dashboard/console', 'menus.dashboard.console', 'ri:home-smile-2-line', 'f', NULL, 'f', 'f', NULL, 'f', 'f', 't', '2026-01-07 06:53:09.690864+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 1, 't', 'f'),(6, 'user-center', 'UserCenter', '/system/user-center', 'menus.system.userCenter', 'ri:user-line', 'f', NULL, 't', 't', NULL, 'f', 't', 'f', '2026-01-07 07:20:40.477837+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(7, 'menu', 'Menus', '/system/menu', 'menus.system.menu', 'ri:menu-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:21:53.540874+00', NULL, '2026-02-07 07:54:25.944+00', NULL, 'f', NULL, '', 2, 3, 't', 'f'),(8, 'dept', 'Dept', '/system/dept', 'menus.system.dept', 'material-symbols:groups-2-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:10.052595+00', NULL, '2026-02-07 07:54:30.697+00', NULL, 'f', NULL, '', 3, 3, 't', 'f'),(20, 'loginLog', 'LoginLog', '/system/log/loginlog', 'menus.system.loginLog', 'ri:login-circle-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:40:46.820945+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f'),(21, 'operLog', 'OperLog', '/system/log/operlog', 'menus.system.operLog', 'ri:settings-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:41:30.611732+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f'),(9, 'dict', 'Dict', '/system/dict', 'menus.system.dict', 'material-symbols:book-2-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:25.225276+00', NULL, '2026-02-07 07:54:36.764+00', NULL, 'f', NULL, '', 4, 3, 't', 'f'),(10, 'api', 'Api', '/system/api', 'menus.system.api', 'tabler:api', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:39.036648+00', NULL, '2026-02-07 07:54:44.057+00', NULL, 'f', NULL, '', 5, 3, 't', 'f'),(18, 'blacklist', 'Blacklist', '/system/blacklist', 'menus.system.blacklist', 'material-symbols:block-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-24 05:35:39.52242+00', NULL, '2026-02-07 07:54:50.803+00', NULL, 'f', NULL, '', 6, 3, 't', 'f'),(3, '/system', 'System', '/index/index', 'menus.system.title', 'ri:user-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 06:57:44.645285+00', NULL, '2026-02-11 07:00:27.571+00', NULL, 'f', NULL, '', 1, 0, 't', 'f'),(22, '/monitor', 'Monitor', '/index/index', 'menus.monitor.title', 'material-symbols:screenshot-monitor-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 06:54:25.075336+00', NULL, '2026-02-11 07:00:34.323+00', NULL, 'f', NULL, '', 2, 0, 't', 'f'),(27, 'storage', 'Storage', '/system/storage', 'menus.system.storage', 'material-symbols:folder-data-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-11 08:47:49.316326+00', NULL, '2026-02-11 08:52:33.669+00', NULL, 'f', NULL, '', 7, 3, 't', 'f'),(28, 'cache', 'Cache', '/monitor/cache', 'menus.monitor.cache', 'devicon-plain:redis', 'f', '', 'f', 'f', '', 'f', 'f', 'f', '2026-03-03 01:33:32.38431+00', NULL, NULL, NULL, 'f', NULL, '', 0, 22, 't', 'f'),(4, 'user', 'User', '/system/user', 'menus.system.user', 'ri:user-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:03:52.388903+00', NULL, '2026-02-07 07:19:41.863+00', NULL, 'f', NULL, '', 0, 3, 't', 'f'),(23, 'online', 'Online', '/monitor/online', 'menus.monitor.online', 'majesticons:status-online', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 07:27:32.894399+00', NULL, '2026-02-07 07:29:04.073+00', NULL, 'f', NULL, '', 1, 22, 't', 'f'),(24, 'job', 'Job', '/monitor/job', 'menus.monitor.job', 'material-symbols:emoji-food-beverage-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 07:43:57.396393+00', NULL, NULL, NULL, 'f', NULL, '', 2, 22, 't', 'f'),(5, 'role', 'Role', '/system/role', 'menus.system.role', 'ri:user-settings-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:05:15.131251+00', NULL, '2026-02-07 07:54:13.275+00', NULL, 'f', NULL, '', 1, 3, 't', 'f'),(26, '/outside/iframe/openapi', 'OpenApi', '', 'menus.outside.openapi', 'akar-icons:graphql-fill', 'f', '', 'f', 'f', 'http://localhost:3000/api/openapi', 't', 't', 'f', '2026-02-11 06:55:41.405065+00', NULL, '2026-03-30 02:53:22.697+00', 1, 'f', NULL, '', 4, 0, 't', 'f'),(29, '/business', 'Business', '/index/index', 'menus.business.title', 'ic:baseline-payment', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:56:03.153104+00', 1, '2026-03-30 03:24:37.636+00', 1, 'f', NULL, '', 3, 0, 't', 'f'),(30, 'merchant', 'Merchant', '/business/merchant', 'menus.business.merchant', 'material-symbols:lock-person-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:57:41.733813+00', 1, '2026-03-30 03:25:52.057+00', 1, 'f', NULL, '', 0, 29, 't', 'f'),(31, 'orders', 'Orders', '/business/orders', 'menus.business.orders', 'material-symbols:orders-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:58:17.068076+00', 1, '2026-03-30 03:29:38.503+00', 1, 'f', NULL, '', 1, 29, 't', 'f'),(32, 'payments', 'Payments', '/business/payments', 'menus.business.payments', 'tabler:brand-paypal', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:58:49.41562+00', 1, '2026-03-30 03:29:51.609+00', 1, 'f', NULL, '', 2, 29, 't', 'f'),(33, 'refund', 'Refund', '/business/refund', 'menus.business.refund', 'material-symbols:quick-reference-all-outline-rounded', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 03:00:26.516263+00', 1, '2026-03-30 03:29:55.728+00', 1, 'f', NULL, '', 3, 29, 't', 'f'),(34, '/outside/iframe/bullmq', 'Bullmq', '', 'menus.monitor.bullmq', 'mdi:bullseye-arrow', 'f', '', 'f', 'f', 'http://localhost:3000/api/bullmq', 't', 't', 'f', '2026-04-14 02:04:15.316618+00', 1, '2026-04-14 02:05:31.267+00', 1, 'f', NULL, '', 3, 22, 't', 'f'),(19, 'log', 'Log', '', 'menus.system.log', 'ri:file-list-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:39:40.82449+00', NULL, '2026-04-14 02:13:20.475+00', 1, 'f', NULL, '', 9, 3, 't', 'f')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu_btn" IN SHARE MODE;
DELETE FROM "public"."system_menu_btn";
INSERT INTO "public"."system_menu_btn" ("menu_id","sort","title","permission","create_time","create_by","update_time","update_by","del_flag","remark","btn_id","status") VALUES (7, 0, '编辑', 'system:menu:update', '2026-01-10 06:00:05.075948+00', NULL, NULL, NULL, 'f', NULL, 2, 't'),(7, 0, '删除', 'system:menu:delete', '2026-01-10 06:00:44.132664+00', NULL, NULL, NULL, 'f', NULL, 3, 't'),(7, 0, '查询', 'system:menu:query', '2026-01-10 06:02:04.390263+00', NULL, NULL, NULL, 'f', NULL, 5, 't'),(7, 1, '新增', 'system:menu:create', '2026-01-10 05:59:43.793701+00', NULL, '2026-01-10 08:23:43.01+00', NULL, 'f', NULL, 1, 't'),(8, 0, '新增', 'system:dept:create', '2026-01-10 08:37:59.572615+00', NULL, NULL, NULL, 'f', NULL, 9, 't'),(8, 0, '删除', 'system:dept:delete', '2026-01-10 08:38:57.597483+00', NULL, NULL, NULL, 'f', NULL, 10, 't'),(8, 0, '更新', 'system:dept:update', '2026-01-10 08:39:12.67185+00', NULL, NULL, NULL, 'f', NULL, 11, 't'),(8, 0, '查询', 'system:dept:query', '2026-01-10 08:39:27.121017+00', NULL, NULL, NULL, 'f', NULL, 12, 't'),(10, 0, '查询', 'system:api:query', '2026-01-10 08:40:18.466495+00', NULL, NULL, NULL, 'f', NULL, 14, 't'),(10, 0, '更新', 'system:api:update', '2026-01-10 08:40:34.207498+00', NULL, NULL, NULL, 'f', NULL, 15, 't'),(10, 0, '删除', 'system:api:delete', '2026-01-10 08:40:45.232152+00', NULL, NULL, NULL, 'f', NULL, 16, 't'),(9, 0, '新增类型', 'system:dict:type:create', '2026-01-10 08:41:15.252098+00', NULL, NULL, NULL, 'f', NULL, 17, 't'),(9, 0, '新增数据', 'system:dict:data:create', '2026-01-10 08:41:36.205116+00', NULL, NULL, NULL, 'f', NULL, 18, 't'),(9, 0, '查询类型', 'system:dict:type:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 19, 't'),(9, 0, '查询数据', 'system:dict:data:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 20, 't'),(9, 0, '更新类型', 'system:dict:type:update', '2026-01-10 08:45:27.870497+00', NULL, NULL, NULL, 'f', NULL, 21, 't'),(9, 0, '更新数据', 'system:dict:data:update', '2026-01-10 08:45:45.848287+00', NULL, NULL, NULL, 'f', NULL, 22, 't'),(9, 0, '删除类型', 'system:dict:type:delete', '2026-01-10 08:46:09.840199+00', NULL, NULL, NULL, 'f', NULL, 23, 't'),(9, 0, '删除数据', 'system:dict:data:delete', '2026-01-10 08:46:22.050204+00', NULL, NULL, NULL, 'f', NULL, 24, 't'),(10, 0, '新增', 'system:api:create', '2026-01-10 08:40:02.457593+00', NULL, '2026-01-10 08:47:05.708+00', NULL, 'f', NULL, 13, 't'),(4, 0, '新增', 'system:user:create', '2026-01-31 08:25:15.877116+00', NULL, NULL, NULL, 'f', NULL, 25, 't'),(4, 0, '查询', 'system:user:query', '2026-01-31 08:25:34.533779+00', NULL, NULL, NULL, 'f', NULL, 26, 't'),(4, 0, '编辑', 'system:user:update', '2026-01-31 08:25:46.97912+00', NULL, NULL, NULL, 'f', NULL, 27, 't'),(4, 0, '删除', 'system:user:delete', '2026-01-31 08:25:59.978634+00', NULL, NULL, NULL, 'f', NULL, 28, 't'),(5, 0, '新增', 'system:role:create', '2026-01-31 08:26:58.242896+00', NULL, NULL, NULL, 'f', NULL, 29, 't'),(5, 0, '查询', 'system:role:query', '2026-01-31 08:27:15.553667+00', NULL, NULL, NULL, 'f', NULL, 30, 't'),(5, 0, '编辑', 'system:role:update', '2026-01-31 08:27:28.725263+00', NULL, NULL, NULL, 'f', NULL, 31, 't'),(5, 0, '删除', 'system:role:delete', '2026-01-31 08:27:47.884927+00', NULL, NULL, NULL, 'f', NULL, 32, 't'),(18, 0, '新增', 'system:ip-black:create', '2026-01-31 08:31:53.257359+00', NULL, NULL, NULL, 'f', NULL, 33, 't'),(18, 0, '查询', 'system:ip-black:query', '2026-01-31 08:32:10.402536+00', NULL, NULL, NULL, 'f', NULL, 34, 't'),(18, 0, '编辑', 'system:ip-black:update', '2026-01-31 08:32:24.058834+00', NULL, NULL, NULL, 'f', NULL, 35, 't'),(18, 0, '删除', 'system:ip-black:delete', '2026-01-31 08:32:37.241391+00', NULL, NULL, NULL, 'f', NULL, 36, 't'),(20, 0, '查询', 'system:login-log:query', '2026-01-31 08:42:39.4695+00', NULL, NULL, NULL, 'f', NULL, 37, 't'),(20, 0, '删除', 'system:login-log:delete', '2026-01-31 08:42:56.434237+00', NULL, NULL, NULL, 'f', NULL, 38, 't'),(21, 0, '查询', 'system:oper-log:query', '2026-01-31 08:43:23.224565+00', NULL, NULL, NULL, 'f', NULL, 39, 't'),(21, 0, '删除', 'system:oper-log:delete', '2026-01-31 08:43:40.619376+00', NULL, NULL, NULL, 'f', NULL, 40, 't'),(23, 0, '查询', 'monitor:online:query', '2026-02-09 06:59:11.207295+00', NULL, NULL, NULL, 'f', NULL, 41, 't'),(23, 0, '强退', 'monitor:online:forceLogout', '2026-02-09 06:59:35.503879+00', NULL, NULL, NULL, 'f', NULL, 42, 't'),(24, 0, '新增', 'monitor:job:create', '2026-02-11 05:48:22.486126+00', NULL, NULL, NULL, 'f', NULL, 43, 't'),(24, 0, '查询', 'monitor:job:query', '2026-02-11 05:48:34.775951+00', NULL, NULL, NULL, 'f', NULL, 44, 't'),(24, 0, '编辑', 'monitor:job:update', '2026-02-11 05:48:46.819656+00', NULL, NULL, NULL, 'f', NULL, 45, 't'),(24, 0, '删除', 'monitor:job:delete', '2026-02-11 05:48:56.613909+00', NULL, NULL, NULL, 'f', NULL, 46, 't'),(27, 0, '新增', 'system:storage:create', '2026-02-11 08:53:02.046018+00', NULL, NULL, NULL, 'f', NULL, 47, 't'),(27, 0, '查询', 'system:storage:query', '2026-02-11 08:53:17.118081+00', NULL, NULL, NULL, 'f', NULL, 48, 't'),(27, 0, '编辑', 'system:storage:update', '2026-02-11 08:53:31.450493+00', NULL, NULL, NULL, 'f', NULL, 49, 't'),(27, 0, '删除', 'system:storage:delete', '2026-02-11 08:53:45.693872+00', NULL, NULL, NULL, 'f', NULL, 50, 't'),(28, 0, '查询', 'monitor:cache:query', '2026-03-03 01:35:55.431547+00', NULL, NULL, NULL, 'f', NULL, 51, 't'),(28, 0, '编辑', 'monitor:cache:update', '2026-03-03 01:36:10.389632+00', NULL, NULL, NULL, 'f', NULL, 52, 't'),(28, 0, '删除', 'monitor:cache:delete', '2026-03-03 01:36:27.703191+00', NULL, NULL, NULL, 'f', NULL, 53, 't'),(30, 0, '新增', 'business:merchant:create', '2026-03-31 01:28:29.717474+00', 1, NULL, NULL, 'f', NULL, 54, 't'),(30, 0, '查询', 'business:merchant:query', '2026-03-31 01:28:47.817944+00', 1, NULL, NULL, 'f', NULL, 55, 't'),(30, 0, '删除', 'business:merchant:delete', '2026-03-31 01:29:16.295828+00', 1, NULL, NULL, 'f', NULL, 57, 't'),(30, 0, '编辑', 'business:merchant:update', '2026-03-31 01:29:04.494807+00', 1, '2026-03-31 01:29:23.831+00', 1, 'f', NULL, 56, 't'),(31, 0, '查询', 'business:orders:query', '2026-04-01 01:19:23.595395+00', 1, NULL, NULL, 'f', NULL, 58, 't'),(31, 0, '更新', 'business:orders:update', '2026-04-01 01:19:40.919376+00', 1, NULL, NULL, 'f', NULL, 59, 't')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_oper_log" IN SHARE MODE;
DELETE FROM "public"."system_oper_log";
INSERT INTO "public"."system_oper_log" ("oper_id","title","request_method","operator_type","user_id","oper_url","oper_ip","oper_location","oper_param","json_result","cost_time","status","create_time","create_by","update_time","update_by","del_flag","remark","action","oper_name") VALUES (284, '系统菜单', '2', NULL, NULL, '/api/system/menu', NULL, NULL, '{"body":{"title":"menus.monitor.bullmq","path":"/outside/iframe/bullmq","name":"Bullmq","component":"","icon":"mdi:bullseye-arrow","showBadge":false,"showTextBadge":"","isHide":false,"isHideTab":false,"link":"http://localhost:3000/api/bullmq","isIframe":false,"keepAlive":false,"fixedTab":false,"activePath":"","sort":0,"status":true,"parentId":22}}', '', 11, 'f', '2026-04-14 01:52:36.483504+00', NULL, NULL, NULL, 'f', NULL, '创建菜单', NULL),(285, '系统菜单', '2', 'admin', 1, '/api/system/menu', '127.0.0.1', '内网地址', '{"body":{"title":"menus.monitor.bullmq","path":"/outside/iframe/bullmq","name":"Bullmq","component":"","icon":"mdi:bullseye-arrow","showBadge":false,"showTextBadge":"","isHide":false,"isHideTab":false,"link":"http://localhost:3000/api/bullmq","isIframe":false,"keepAlive":true,"fixedTab":false,"activePath":"","sort":3,"status":true,"parentId":22,"createBy":1}}', '{"code":200,"msg":"操作成功","data":null}', 59, 't', '2026-04-14 02:04:15.326832+00', NULL, NULL, NULL, 'f', NULL, '创建菜单', 'admin'),(286, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 41, 't', '2026-04-14 02:04:56.811753+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(287, '系统菜单', '3', 'admin', 1, '/api/system/menu', '127.0.0.1', '内网地址', '{"body":{"menuId":34,"path":"/outside/iframe/bullmq","name":"Bullmq","component":"","title":"menus.monitor.bullmq","icon":"mdi:bullseye-arrow","showBadge":false,"showTextBadge":"","isHide":false,"isHideTab":false,"link":"http://localhost:3000/api/bullmq","isIframe":true,"keepAlive":true,"fixedTab":false,"activePath":"","sort":3,"status":true,"parentId":22,"updateBy":1,"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 27, 't', '2026-04-14 02:05:31.281633+00', NULL, NULL, NULL, 'f', NULL, '更新菜单', 'admin'),(288, '系统菜单', '3', 'admin', 1, '/api/system/menu', '127.0.0.1', '内网地址', '{"body":{"menuId":19,"path":"log","name":"Log","component":"","title":"menus.system.log","icon":"ri:file-list-3-line","showBadge":false,"showTextBadge":"","isHide":false,"isHideTab":false,"link":"","isIframe":false,"keepAlive":true,"fixedTab":false,"activePath":"","sort":9,"status":true,"parentId":3,"updateBy":1,"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 18, 't', '2026-04-14 02:13:20.490602+00', NULL, NULL, NULL, 'f', NULL, '更新菜单', 'admin'),(289, '系统菜单', '2', 'admin', 1, '/api/system/menu', '127.0.0.1', '内网地址', '{"body":{"title":"menus.system.queue","path":"queue","name":"Queue","component":"/system/queue","icon":"tdesign:queue","showBadge":false,"showTextBadge":"","isHide":false,"isHideTab":false,"link":"","isIframe":false,"keepAlive":true,"fixedTab":false,"activePath":"","sort":8,"status":true,"parentId":3,"createBy":1}}', '{"code":200,"msg":"操作成功","data":null}', 36, 't', '2026-04-14 02:14:12.222355+00', NULL, NULL, NULL, 'f', NULL, '创建菜单', 'admin'),(290, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 26, 't', '2026-04-14 02:14:32.935277+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(291, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 51, 't', '2026-04-14 09:23:44.481238+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(292, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 68, 't', '2026-04-14 09:31:15.445648+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(293, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 21, 't', '2026-04-14 09:31:31.590496+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(294, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 14, 't', '2026-04-14 09:31:37.817882+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(295, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 17, 't', '2026-04-14 09:31:42.007372+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(296, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 63, 't', '2026-04-14 09:35:34.988541+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(297, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":{},"updateTime":{}}}', '{"code":200,"msg":"操作成功","data":null}', 70, 't', '2026-04-14 09:37:18.217109+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(298, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 10, 'f', '2026-04-16 06:10:14.980111+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(299, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 8, 'f', '2026-04-16 06:10:15.977723+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(300, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 16, 'f', '2026-04-16 06:10:29.571121+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(301, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 13, 'f', '2026-04-16 06:10:41.929085+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(302, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 4, 'f', '2026-04-16 06:10:42.687508+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(303, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 4, 'f', '2026-04-16 06:10:43.166686+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(304, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 8, 'f', '2026-04-16 06:10:43.330256+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(305, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 3, 'f', '2026-04-16 06:10:43.518726+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(306, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 4, 'f', '2026-04-16 06:10:43.665141+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(307, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 17, 'f', '2026-04-16 06:10:54.184183+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(308, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 5, 'f', '2026-04-16 06:11:05.381746+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(309, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 3, 'f', '2026-04-16 06:11:06.191194+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(310, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 3, 'f', '2026-04-16 06:11:07.003449+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(311, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 5, 'f', '2026-04-16 06:11:07.238371+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(312, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":false,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 8, 'f', '2026-04-16 06:11:07.433521+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(313, '定时任务', '3', 'admin', 1, '/api/monitor/job', '127.0.0.1', '内网地址', '{"body":{"jobId":8,"jobName":"测试任务","jobCron":"0 * * * * *","jobArgs":"[\"乔治\",19,true]","status":true,"createBy":null,"updateBy":1,"delFlag":false,"remark":"","createTime":"2026-02-10T02:17:20.145Z","updateTime":"2026-04-14T09:37:18.209Z"}}', '{"code":400,"msg":"不可操作数据"}', 11, 'f', '2026-04-16 06:11:09.764991+00', NULL, NULL, NULL, 'f', NULL, '更新', 'admin'),(314, '商户模块', '2', 'admin', 1, '/api/business/merchant', '127.0.0.1', '内网地址', '{"body":{"name":"乔治","status":true,"remark":"","createBy":1}}', '{"code":200,"msg":"操作成功","data":null}', 18, 't', '2026-04-18 01:34:51.515866+00', NULL, NULL, NULL, 'f', NULL, '创建', 'admin'),(315, '系统部门', '2', 'admin', 1, '/api/system/dept', '127.0.0.1', '内网地址', '{"body":{"deptName":"测试公司","parentId":1,"status":true,"sort":0,"remark":"","createBy":1}}', '{"code":200,"msg":"操作成功","data":null}', 39, 't', '2026-04-18 01:37:39.00021+00', NULL, NULL, NULL, 'f', NULL, '创建', 'admin'),(316, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 22, 't', '2026-04-18 01:39:10.986203+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(317, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 44, 't', '2026-04-18 01:44:07.493324+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(318, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 35, 't', '2026-04-18 01:45:16.735715+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(319, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 56, 't', '2026-04-18 01:54:22.661939+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(320, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 72, 't', '2026-04-18 02:03:44.41279+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(321, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 37, 't', '2026-04-18 02:07:58.659592+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(322, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 40, 't', '2026-04-18 02:22:25.567916+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(323, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 23, 't', '2026-04-18 02:22:46.695348+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(324, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 28, 't', '2026-04-18 02:36:10.959498+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(325, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 33, 't', '2026-04-18 02:37:19.32306+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(326, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 31, 't', '2026-04-18 02:37:39.324056+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(327, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 44, 't', '2026-04-18 02:46:43.203169+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(328, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 34, 't', '2026-04-18 02:47:54.123009+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(329, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 47, 't', '2026-04-18 02:49:18.290234+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(330, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 34, 't', '2026-04-18 02:50:59.792072+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(331, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 23, 't', '2026-04-18 02:51:37.041499+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin'),(332, '系统角色', '3', 'admin', 1, '/api/system/role/permission', '127.0.0.1', '内网地址', '{"body":{"roleId":1,"permissions":[{"menuId":1},{"menuId":2},{"menuId":3},{"menuId":4},{"menuId":4,"menuBtnId":25},{"menuId":4,"menuBtnId":26},{"menuId":4,"menuBtnId":27},{"menuId":4,"menuBtnId":28},{"menuId":6},{"menuId":5},{"menuId":5,"menuBtnId":29},{"menuId":5,"menuBtnId":30},{"menuId":5,"menuBtnId":31},{"menuId":5,"menuBtnId":32},{"menuId":7},{"menuId":7,"menuBtnId":2},{"menuId":7,"menuBtnId":3},{"menuId":7,"menuBtnId":5},{"menuId":7,"menuBtnId":1},{"menuId":8},{"menuId":8,"menuBtnId":9},{"menuId":8,"menuBtnId":10},{"menuId":8,"menuBtnId":11},{"menuId":8,"menuBtnId":12},{"menuId":9},{"menuId":9,"menuBtnId":17},{"menuId":9,"menuBtnId":18},{"menuId":9,"menuBtnId":19},{"menuId":9,"menuBtnId":20},{"menuId":9,"menuBtnId":21},{"menuId":9,"menuBtnId":22},{"menuId":9,"menuBtnId":23},{"menuId":9,"menuBtnId":24},{"menuId":10},{"menuId":10,"menuBtnId":14},{"menuId":10,"menuBtnId":15},{"menuId":10,"menuBtnId":16},{"menuId":10,"menuBtnId":13},{"menuId":18},{"menuId":18,"menuBtnId":33},{"menuId":18,"menuBtnId":34},{"m', '{"code":200,"msg":"操作成功","data":null}', 25, 't', '2026-04-18 02:51:45.683304+00', NULL, NULL, NULL, 'f', NULL, '更新角色权限', 'admin')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_role" IN SHARE MODE;
DELETE FROM "public"."system_role";
INSERT INTO "public"."system_role" ("role_id","role_name","role_code","sort","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (1, '超级管理员', 'SYS_ADMIN', 0, 't', '2026-01-06 09:26:09.913+00', NULL, '2026-01-26 07:47:22.124+00', NULL, 'f', '拥有所有权限'),(2, '普通用户', 'SYS_USER', 1, 't', '2026-01-26 07:49:34.217+00', NULL, '2026-01-26 07:51:24.879+00', NULL, 'f', '拥有普通用户权限'),(3, '财务', 'SYS_FINANCE', 2, 't', '2026-01-26 07:58:12.195+00', NULL, '2026-01-26 07:58:22.786+00', NULL, 'f', '拥有财务权限')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_role_menu" IN SHARE MODE;
DELETE FROM "public"."system_role_menu";
INSERT INTO "public"."system_role_menu" ("role_id","menu_id","menu_btn_id") VALUES (2, 1, NULL),(2, 2, NULL),(1, 1, NULL),(1, 2, NULL),(1, 3, NULL),(1, 4, NULL),(1, 4, 25),(1, 4, 26),(1, 4, 27),(1, 4, 28),(1, 6, NULL),(1, 5, NULL),(1, 5, 29),(1, 5, 30),(1, 5, 31),(1, 5, 32),(1, 7, NULL),(1, 7, 2),(1, 7, 3),(1, 7, 5),(1, 7, 1),(1, 8, NULL),(1, 8, 9),(1, 8, 10),(1, 8, 11),(1, 8, 12),(1, 9, NULL),(1, 9, 17),(1, 9, 18),(1, 9, 19),(1, 9, 20),(1, 9, 21),(1, 9, 22),(1, 9, 23),(1, 9, 24),(1, 10, NULL),(1, 10, 14),(1, 10, 15),(1, 10, 16),(1, 10, 13),(1, 18, NULL),(1, 18, 33),(1, 18, 34),(1, 18, 35),(1, 18, 36),(1, 27, NULL),(1, 27, 47),(1, 27, 48),(1, 27, 49),(1, 27, 50),(1, 19, NULL),(1, 20, NULL),(1, 20, 37),(1, 20, 38),(1, 21, NULL),(1, 21, 39),(1, 21, 40),(1, 22, NULL),(1, 28, NULL),(1, 28, 51),(1, 28, 52),(1, 28, 53),(1, 23, NULL),(1, 23, 41),(1, 23, 42),(1, 24, NULL),(1, 24, 43),(1, 24, 44),(1, 24, 45),(1, 24, 46),(1, 34, NULL),(1, 29, NULL),(1, 30, NULL),(1, 30, 54),(1, 30, 55),(1, 30, 57),(1, 30, 56),(1, 31, NULL),(1, 31, 58),(1, 31, 59),(1, 32, NULL),(1, 33, NULL),(1, 26, NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_storage" IN SHARE MODE;
DELETE FROM "public"."system_storage";
INSERT INTO "public"."system_storage" ("storage_id","name","endpoint","bucket","access_key","secret_key","status","create_time","create_by","update_time","update_by","del_flag","remark","region") VALUES (3, 'OSS', NULL, NULL, NULL, NULL, 'f', '2026-02-11 09:02:14.601+00', NULL, '2026-02-11 09:19:00.464+00', NULL, 'f', '阿里云', NULL),(4, 'Kodo', NULL, NULL, NULL, NULL, 'f', '2026-02-11 09:02:30.982+00', NULL, '2026-02-11 09:19:00.937+00', NULL, 'f', '七牛云', NULL),(2, 'COS', '', '', '', '', 'f', '2026-02-11 09:01:42.312+00', NULL, NULL, NULL, 'f', '腾讯云', 'ap-shanghai'),(1, 'RustFS', '192.168.2.22:9000', 'public', 'rustfsadmin', 'rustfsadmin', 't', '2026-02-11 09:01:32.285+00', NULL, NULL, NULL, 'f', '该方案为本地文件服务，使用RustFS。前端拿到预签名url，需要在Header中传递Content-Type值，否则文件会直接下载无法预览。', 'us-east-1')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user" IN SHARE MODE;
DELETE FROM "public"."system_user";
INSERT INTO "public"."system_user" ("user_id","username","password","nickname","email","phone","sex","avatar","create_time","create_by","update_time","update_by","del_flag","remark","status","dept_id") VALUES (13, 'xiaomei', '$2b$10$ZVclyurmYrDZqiZE.L2/H.PCKgTENOM9u0Hh2zNv/QjvtnMrNgxhy', '罗德风', '2652365944@qq.com', NULL, '0', NULL, '2025-12-16 02:36:49.177028+00', NULL, NULL, NULL, 'f', NULL, 't', NULL),(20, 'admin123', '$2b$10$a5yygkWI2t3HZxGDqP3Ifej15jK/OyZ6eC4iL.c4x/QpmrLfeEbOa', '老妖', '423235235@qq.com', '19890987675', '1', NULL, '2026-02-04 06:39:33.443815+00', NULL, NULL, NULL, 'f', NULL, 't', 1),(14, 'qiaozhi', '$2b$10$6OiXvq9fYO.WS214b3m79e0UC4yk9cCftFUc4AKKBW/EcGuXxKwRu', '乔治', '43242@qq.com', '19898767656', '1', NULL, '2026-02-03 06:19:16.744+00', NULL, NULL, NULL, 'f', NULL, 't', 8),(1, 'admin', '$2b$10$YfJS21FBqTmpM4pc8I0j.uXX5rnhEiDM76Bm4u2h0mLzStfdFXgTi', '梅山老妖', '1360658549@qq.com', '19899999999', '0', '', '2025-12-12 08:41:41.858+00', NULL, '2026-02-06 03:34:28.268+00', 1765869150583, 'f', '专注于用户体验跟视觉设计', 't', 4)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user_role" IN SHARE MODE;
DELETE FROM "public"."system_user_role";
INSERT INTO "public"."system_user_role" ("role_id","user_id") VALUES (3, 20),(2, 20),(2, 14),(3, 14),(1, 1),(2, 1),(3, 1)
;
COMMIT;
ALTER TABLE "business_merchant" ADD CONSTRAINT "business_merchant_pkey" PRIMARY KEY ("id");
ALTER TABLE "business_merchant_configs" ADD CONSTRAINT "merchant_payment_configs_pkey" PRIMARY KEY ("id");
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_pkey" PRIMARY KEY ("id");
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_pkey" PRIMARY KEY ("id");
ALTER TABLE "business_refund" ADD CONSTRAINT "business_refund_pkey" PRIMARY KEY ("id");
ALTER TABLE "monitor_job" ADD CONSTRAINT "monitor_job_pkey" PRIMARY KEY ("job_id");
ALTER TABLE "system_api" ADD CONSTRAINT "system_api_pkey" PRIMARY KEY ("api_id");
ALTER TABLE "system_dept" ADD CONSTRAINT "system_dept_pkey" PRIMARY KEY ("dept_id");
ALTER TABLE "system_dict_data" ADD CONSTRAINT "system_dict_data_pkey" PRIMARY KEY ("dict_code");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_pkey" PRIMARY KEY ("dict_id");
ALTER TABLE "system_ip_black" ADD CONSTRAINT "system_ip_black_pkey" PRIMARY KEY ("ip_black_id");
ALTER TABLE "system_login_log" ADD CONSTRAINT "system_login_log_pkey" PRIMARY KEY ("log_id");
ALTER TABLE "system_menu" ADD CONSTRAINT "system_menu_pkey" PRIMARY KEY ("menu_id");
ALTER TABLE "system_menu_btn" ADD CONSTRAINT "system_menu_btn_pkey" PRIMARY KEY ("btn_id");
ALTER TABLE "system_oper_log" ADD CONSTRAINT "system_oper_log_pkey" PRIMARY KEY ("oper_id");
ALTER TABLE "system_role" ADD CONSTRAINT "system_role_pkey" PRIMARY KEY ("role_id");
ALTER TABLE "system_storage" ADD CONSTRAINT "system_storage_pkey" PRIMARY KEY ("storage_id");
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_pkey" PRIMARY KEY ("user_id");
ALTER TABLE "business_merchant_configs" ADD CONSTRAINT "business_merchant_configs_merchant_id_business_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."business_merchant" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_order_no_unique" UNIQUE ("order_no");
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_merchant_id_business_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."business_merchant" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_payment_no_unique" UNIQUE ("payment_no");
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_merchant_config_id_business_merchant_configs_" FOREIGN KEY ("merchant_config_id") REFERENCES "public"."business_merchant_configs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_order_id_business_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."business_orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_refund" ADD CONSTRAINT "business_refund_refund_no_unique" UNIQUE ("refund_no");
ALTER TABLE "business_refund" ADD CONSTRAINT "business_refund_order_id_business_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."business_orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_refund" ADD CONSTRAINT "business_refund_payment_id_business_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."business_payments" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "monitor_job" ADD CONSTRAINT "monitor_job_job_name_unique" UNIQUE ("job_name");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_name_unique" UNIQUE ("dict_name");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_type_unique" UNIQUE ("dict_type");
ALTER TABLE "system_ip_black" ADD CONSTRAINT "system_ip_black_ip_address_unique" UNIQUE ("ip_address");
ALTER TABLE "system_menu_btn" ADD CONSTRAINT "system_menu_btn_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_menu_btn_id_system_menu_btn_btn_id_fk" FOREIGN KEY ("menu_btn_id") REFERENCES "public"."system_menu_btn" ("btn_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_role_id_system_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."system_role" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_storage" ADD CONSTRAINT "system_storage_name_unique" UNIQUE ("name");
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_username_unique" UNIQUE ("username");
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_dept_id_system_dept_dept_id_fk" FOREIGN KEY ("dept_id") REFERENCES "public"."system_dept" ("dept_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user_role" ADD CONSTRAINT "system_user_role_role_id_system_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."system_role" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user_role" ADD CONSTRAINT "system_user_role_user_id_system_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."system_user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER SEQUENCE "business_merchant_id_seq"
OWNED BY "business_merchant"."id";
SELECT setval('"business_merchant_id_seq"', 8, true);
ALTER SEQUENCE "business_merchant_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "business_orders_id_seq"
OWNED BY "business_orders"."id";
SELECT setval('"business_orders_id_seq"', 20, true);
ALTER SEQUENCE "business_orders_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "business_payments_id_seq"
OWNED BY "business_payments"."id";
SELECT setval('"business_payments_id_seq"', 1, false);
ALTER SEQUENCE "business_payments_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "business_refund_id_seq"
OWNED BY "business_refund"."id";
SELECT setval('"business_refund_id_seq"', 1, false);
ALTER SEQUENCE "business_refund_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "merchant_payment_configs_id_seq"
OWNED BY "business_merchant_configs"."id";
SELECT setval('"merchant_payment_configs_id_seq"', 4, true);
ALTER SEQUENCE "merchant_payment_configs_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "monitor_job_job_id_seq"
OWNED BY "monitor_job"."job_id";
SELECT setval('"monitor_job_job_id_seq"', 8, true);
ALTER SEQUENCE "monitor_job_job_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_api_api_id_seq"
OWNED BY "system_api"."api_id";
SELECT setval('"system_api_api_id_seq"', 329, true);
ALTER SEQUENCE "system_api_api_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dept_dept_id_seq"
OWNED BY "system_dept"."dept_id";
SELECT setval('"system_dept_dept_id_seq"', 9, true);
ALTER SEQUENCE "system_dept_dept_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dict_data_dict_code_seq"
OWNED BY "system_dict_data"."dict_code";
SELECT setval('"system_dict_data_dict_code_seq"', 32, true);
ALTER SEQUENCE "system_dict_data_dict_code_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dict_type_dict_id_seq"
OWNED BY "system_dict_type"."dict_id";
SELECT setval('"system_dict_type_dict_id_seq"', 10, true);
ALTER SEQUENCE "system_dict_type_dict_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_ip_black_ip_black_id_seq"
OWNED BY "system_ip_black"."ip_black_id";
SELECT setval('"system_ip_black_ip_black_id_seq"', 6, true);
ALTER SEQUENCE "system_ip_black_ip_black_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_login_log_log_id_seq"
OWNED BY "system_login_log"."log_id";
SELECT setval('"system_login_log_log_id_seq"', 198, true);
ALTER SEQUENCE "system_login_log_log_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_btn_btn_id_seq"
OWNED BY "system_menu_btn"."btn_id";
SELECT setval('"system_menu_btn_btn_id_seq"', 59, true);
ALTER SEQUENCE "system_menu_btn_btn_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_menu_id_seq"
OWNED BY "system_menu"."menu_id";
SELECT setval('"system_menu_menu_id_seq"', 35, true);
ALTER SEQUENCE "system_menu_menu_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_oper_log_oper_id_seq"
OWNED BY "system_oper_log"."oper_id";
SELECT setval('"system_oper_log_oper_id_seq"', 332, true);
ALTER SEQUENCE "system_oper_log_oper_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_role_role_id_seq"
OWNED BY "system_role"."role_id";
SELECT setval('"system_role_role_id_seq"', 6, true);
ALTER SEQUENCE "system_role_role_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_storage_storage_id_seq"
OWNED BY "system_storage"."storage_id";
SELECT setval('"system_storage_storage_id_seq"', 4, true);
ALTER SEQUENCE "system_storage_storage_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_user_user_id_seq"
OWNED BY "system_user"."user_id";
SELECT setval('"system_user_user_id_seq"', 20, true);
ALTER SEQUENCE "system_user_user_id_seq" OWNER TO "postgres";

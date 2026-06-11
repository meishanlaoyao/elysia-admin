/*
PostgreSQL Backup
Database: elysia-admin/public
Backup Time: 2026-06-11 10:13:15
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
CREATE TABLE "business_merchant" (
  "id" int8 NOT NULL DEFAULT nextval('business_merchant_id_seq'::regclass),
  "name" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_merchant_configs" OWNER TO "postgres";
CREATE TABLE "business_orders" (
  "id" int8 NOT NULL DEFAULT nextval('business_orders_id_seq'::regclass),
  "order_no" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "merchant_id" int8 NOT NULL,
  "title" varchar(200) COLLATE "pg_catalog"."default" NOT NULL,
  "description" varchar(500) COLLATE "pg_catalog"."default",
  "amount" numeric(10,2) NOT NULL,
  "currency" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'CNY'::character varying,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "expire_time" timestamp(6),
  "extra" jsonb DEFAULT '{}'::jsonb,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "business_orders" OWNER TO "postgres";
CREATE TABLE "business_payments" (
  "id" int8 NOT NULL DEFAULT nextval('business_payments_id_seq'::regclass),
  "order_id" int8 NOT NULL,
  "merchant_config_id" int8 NOT NULL,
  "payment_no" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "platform" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "amount" numeric(10,2) DEFAULT 0,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "third_trade_no" varchar(100) COLLATE "pg_catalog"."default",
  "extra" jsonb DEFAULT '{}'::jsonb,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "order_no" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "payment_method" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "user_id" varchar(36) COLLATE "pg_catalog"."default",
  "oper_url" varchar(256) COLLATE "pg_catalog"."default",
  "oper_ip" varchar(128) COLLATE "pg_catalog"."default",
  "oper_location" varchar(256) COLLATE "pg_catalog"."default",
  "oper_param" varchar(1024) COLLATE "pg_catalog"."default",
  "json_result" varchar(1024) COLLATE "pg_catalog"."default",
  "cost_time" int4,
  "status" bool,
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
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
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "region" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_storage" OWNER TO "postgres";
CREATE TABLE "system_user" (
  "username" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "password" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nickname" varchar(64) COLLATE "pg_catalog"."default",
  "email" varchar(64) COLLATE "pg_catalog"."default",
  "phone" varchar(11) COLLATE "pg_catalog"."default",
  "sex" varchar(1) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "avatar" varchar(255) COLLATE "pg_catalog"."default",
  "create_time" timestamptz(6) DEFAULT now(),
  "create_by" varchar(36) COLLATE "pg_catalog"."default",
  "update_time" timestamptz(6),
  "update_by" varchar(36) COLLATE "pg_catalog"."default",
  "del_flag" bool DEFAULT false,
  "remark" varchar(255) COLLATE "pg_catalog"."default",
  "status" bool DEFAULT true,
  "dept_id" int8,
  "user_id" uuid NOT NULL DEFAULT gen_random_uuid()
)
;
ALTER TABLE "system_user" OWNER TO "postgres";
CREATE TABLE "system_user_role" (
  "role_id" int8,
  "user_id" uuid
)
;
ALTER TABLE "system_user_role" OWNER TO "postgres";
BEGIN;
LOCK TABLE "public"."business_merchant" IN SHARE MODE;
DELETE FROM "public"."business_merchant";
INSERT INTO "public"."business_merchant" ("id","name","create_time","create_by","update_time","update_by","del_flag","remark","status") VALUES (6, '梅山老妖', '2026-03-31 02:27:18.421+00', '1', '2026-03-31 07:41:35.938+00', '1', 'f', '', 't')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_merchant_configs" IN SHARE MODE;
DELETE FROM "public"."business_merchant_configs";
INSERT INTO "public"."business_merchant_configs" ("id","merchant_id","channel","app_id","mch_id","private_key","public_key","config","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (2, 6, 'wechat', NULL, NULL, NULL, NULL, NULL, 't', '2026-03-31 06:29:22.418176+00', '1', NULL, NULL, 'f', ''),(3, 6, 'paypal', NULL, NULL, NULL, NULL, NULL, 't', '2026-03-31 06:29:26.17941+00', '1', NULL, NULL, 'f', ''),(1, 6, 'alipay', '', NULL, '', '', '{"notifyUrl": "https://www.u2920048.nyat.app:65314/api/business/payments/notify", "returnUrl": "https://www.u2920048.nyat.app:65314/api/business/payments/return"}', 't', '2026-03-31 05:39:10.715+00', '1', '2026-05-10 12:33:55.871+00', '1', 'f', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_orders" IN SHARE MODE;
DELETE FROM "public"."business_orders";
INSERT INTO "public"."business_orders" ("id","order_no","user_id","merchant_id","title","description","amount","currency","status","expire_time","extra","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (35, '019dee1a67917000a0791158e7c4e27b', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 12899.00, 'CNY', '0', '2026-05-04 14:06:01', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "product": {"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, "marketing": {"couponId": null, "discountAmount": 0}}', '2026-05-03 13:50:01.107075+00', '1', NULL, NULL, 'f', NULL),(37, '019dee3830c77000bbb4d2f7230574b6', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 12899.00, 'CNY', '1', '2026-05-03 14:38:33.159', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "product": {"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, "marketing": {"couponId": null, "discountAmount": 0}}', '2026-05-03 14:22:33.161349+00', '1', NULL, NULL, 'f', NULL),(36, '019dee360a887000b1db1412f9c8bc32', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 12899.00, 'CNY', '3', '2026-05-03 14:36:12.296', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "product": {"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, "marketing": {"couponId": null, "discountAmount": 0}}', '2026-05-03 14:20:12.302083+00', '1', NULL, NULL, 'f', NULL),(38, '019df29acec57000bd50bc712a8d1098', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 12899.00, 'CNY', '3', '2026-05-04 11:04:44.997', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "product": {"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, "marketing": {"couponId": null, "discountAmount": 0}}', '2026-05-04 10:48:44.999016+00', '1', NULL, NULL, 'f', NULL),(43, '019df660189a7000b9c1f1bd13b3ce98', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '1', '2026-05-05 04:39:06.138', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 04:23:06.13993+00', '1', '2026-05-05 04:23:40.217+00', NULL, 'f', NULL),(39, '019df2c9889f7000880a1f2a4969fb1d', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '0', '2026-05-04 12:55:47.23', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-04 11:39:47.23226+00', '1', NULL, NULL, 'f', NULL),(40, '019df331e72e7000a062409a1ff45f98', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '1', '2026-05-04 13:49:47.182', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-04 13:33:47.184446+00', '1', '2026-05-04 13:37:58.522+00', NULL, 'f', NULL),(41, '019df65a59f7700099efa7b449400cb3', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-05 04:32:49.654', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 04:16:49.656371+00', '1', NULL, NULL, 'f', NULL),(42, '019df65dd70570009f9de2fdcfa711fc', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-05 04:36:38.277', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 04:20:38.27881+00', '1', NULL, NULL, 'f', NULL),(44, '019df6f1615070008ba953889e5273eb', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-05 07:17:47.472', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 07:01:47.473965+00', '1', NULL, NULL, 'f', NULL),(45, '019df6fe64947000bf99473fb7d7594a', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-05 07:32:00.276', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 07:16:00.277583+00', '1', NULL, NULL, 'f', NULL),(47, '019df74f007a7000a745dd7d169f2933', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '1', '2026-05-05 09:00:03.066', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 08:44:03.069063+00', '1', '2026-05-05 08:45:50.287+00', NULL, 'f', NULL),(46, '019df74e37f47000afec7155fd731b1d', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-05 08:59:11.732', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-05 08:43:11.733452+00', '1', NULL, NULL, 'f', NULL),(48, '019dfd6c0fec700089b9a4121332cc01', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-06 13:29:30.86', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-06 13:13:30.861648+00', '1', NULL, NULL, 'f', NULL),(49, '019dfd6e5fe97000a5e9e9fcc76ec9e3', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-06 13:32:02.41', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-06 13:16:02.413267+00', '1', NULL, NULL, 'f', NULL),(50, '019dfd7b48327000b1b75bc17b852b7c', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-06 13:46:08.306', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-06 13:30:08.308152+00', '1', NULL, NULL, 'f', NULL),(51, '019dfd7bb48770009ac152588fe6c79f', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-06 13:46:36.039', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-06 13:30:36.040551+00', '1', NULL, NULL, 'f', NULL),(52, '019e02599d1b7000a9e222d8848e5338', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-07 12:27:27.899', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-07 12:11:27.901084+00', '1', NULL, NULL, 'f', NULL),(55, '019e0cdf2ea0700099dc46c21de5137d', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '1', '2026-05-09 13:29:33.6', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-09 13:13:33.602679+00', '1', '2026-05-09 13:14:12.72+00', NULL, 'f', NULL),(53, '019e0cd850ba7000aed3bcfd4076c7d3', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-09 13:22:03.578', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-09 13:06:03.580096+00', '1', NULL, NULL, 'f', NULL),(54, '019e0cdce9747000a3824c22fe0761c5', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '3', '2026-05-09 13:27:04.819', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-09 13:11:04.821935+00', '1', NULL, NULL, 'f', NULL),(58, '019e20155a787000b8e1931cced0d7af', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '0', '2026-05-13 07:01:30.872', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-13 06:45:30.87176+00', '1', NULL, NULL, 'f', NULL),(56, '019e101dcea4700088413b734efc7b6d', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '1', '2026-05-10 04:36:49.444', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-10 04:20:49.445581+00', '1', '2026-05-13 06:19:06.428+00', '1', 'f', '666，不早说'),(57, '019e200d95cf700085356bb647028742', '1', 6, 'DR钻戒-求婚系列', '一生只送一人，真爱唯一的承诺', 25698.00, 'CNY', '0', '2026-05-13 06:53:01.775', '{"user": {"phone": "13800138000", "userId": 1, "address": "北京市海淀区中关村软件园二期", "nickname": "张三", "postalCode": "100000"}, "products": [{"specs": "圈口: 12号; 材质: 18K金; 主钻: 30分", "productId": 101, "productNum": 1, "productName": "DR钻戒-心形1克拉", "productPrice": 12899, "productTotal": 12899}, {"specs": "圈口: 男15号/女12号; 材质: PT950铂金", "productId": 102, "productNum": 1, "productName": "DR对戒-经典款", "productPrice": 12799, "productTotal": 12799}], "marketing": {"couponId": null, "couponName": "", "discountAmount": 0}}', '2026-05-13 06:37:01.776472+00', '1', NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_payments" IN SHARE MODE;
DELETE FROM "public"."business_payments";
INSERT INTO "public"."business_payments" ("id","order_id","merchant_config_id","payment_no","platform","amount","status","third_trade_no","extra","create_time","create_by","update_time","update_by","del_flag","remark","order_no","payment_method") VALUES (28, 40, 6, '019df331f83e7000b2de26e4f53e62f1', 'pc', 25698.00, '1', '2026050422001465370508927076', '{"sign": "TFISPrP57P7n8+feY4ocqMn6SKW7fEGFueEhPOyYzjrWDpNwmwmspUQpBMJId0hwqMk65uYOstKN8sEfirPBBNCWY8h5BhQHurj1iy9e6dRVBlkDWQEEXf4Btlum8tcXN3xVPhXG6GZ7GfyCOCHJIT4PBYWfwUxjNYA6BIM+s93qFtF27iZBJXaHvjbBEToqFRDVagIOSKhNl303rAMHSLTFG7aw6pNxoHvxMX66/Fgzc9/JovFFlkzPNNM1M91b5nrrxtTRVAavF8w0tEYQjeMu71BSdkRUH9xUCSJVaZmPPWO7zieliqK50iyMz2WseWPiSsRGR/O+oj6gAvc/EQ==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026050422001465370508927076", "notify_id": "2026050401222213512165370508936369", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-04 21:34:53", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-04 21:35:11", "notify_time": "2026-05-04 21:35:13", "notify_type": "trade_status_sync", "out_trade_no": "019df331f83e7000b2de26e4f53e62f1", "point_amount": "0.00", "total_amount": "25698.00", "trade_status": "TRADE_SUCCESS", "fund_bill_list": "[{\"amount\":\"25698.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "25698.00", "receipt_amount": "25698.00", "buyer_pay_amount": "25698.00"}', '2026-05-04 13:33:51.552983+00', '1', '2026-05-04 13:37:58.52+00', NULL, 'f', NULL, '019df331e72e7000a062409a1ff45f98', 'alipay'),(31, 43, 6, '019df66041807000b63dc1fefaad9aea', 'pc', 25698.00, '1', '2026050522001465370508933570', '{"sign": "LMbysFAFxdVhwqzG95w93QPcMXSarbuh5K0lnnolB+QLebmYEnFK5WImOm9g2VQbFre650W0HX2c4653fC4i/OoFunrbV665kqfVUYMlDzwafknQXZiINWpUKMmRi4fYYKq3GqKiOYNXCrkrq6umPVI0qMSGvOcOjDrGopRA5WT//8axGCfuXlfCt7Qu0DzwN7NKwOdPLvHtoD8vec8O9wXjE52VtnvDmWXuXdqwYaBraZaT/puYrNltimnmy/q+tuPK49kPggNHN+nB99mbDOj6ZJ4fXzChkHWgQ0OigititkV8biO/JUkEuHaLj3Fr8TIP/flm+YU4i5d34wyScg==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026050522001465370508933570", "notify_id": "2026050501222122341165370508943879", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-05 12:23:34", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-05 12:23:40", "notify_time": "2026-05-05 12:23:41", "notify_type": "trade_status_sync", "out_trade_no": "019df66041807000b63dc1fefaad9aea", "point_amount": "0.00", "total_amount": "25698.00", "trade_status": "TRADE_SUCCESS", "fund_bill_list": "[{\"amount\":\"25698.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "25698.00", "receipt_amount": "25698.00", "buyer_pay_amount": "25698.00"}', '2026-05-05 04:23:16.611178+00', '1', '2026-05-05 04:23:40.213+00', NULL, 'f', NULL, '019df660189a7000b9c1f1bd13b3ce98', 'alipay'),(29, 41, 6, '019df65a815570009ad9c43f09f31e14', 'pc', 0.00, '3', NULL, '{}', '2026-05-05 04:16:59.737127+00', '1', NULL, NULL, 'f', NULL, '019df65a59f7700099efa7b449400cb3', 'alipay'),(30, 42, 6, '019df65e00957000bf965e21eb36160a', 'pc', 0.00, '3', NULL, '{}', '2026-05-05 04:20:48.919713+00', '1', NULL, NULL, 'f', NULL, '019df65dd70570009f9de2fdcfa711fc', 'alipay'),(32, 44, 6, '019df6f2df837000918ad43e6a0ebef8', 'pc', 0.00, '3', NULL, '{}', '2026-05-05 07:03:25.317468+00', '1', NULL, NULL, 'f', NULL, '019df6f1615070008ba953889e5273eb', 'alipay'),(24, 35, 6, '019dee1d6d267000b8997a5e6eb8646c', 'pc', 0.00, '0', NULL, '{}', '2026-05-03 13:53:19.149086+00', '1', '2026-05-03 14:19:50.34+00', '1', 'f', NULL, '019dee1a67917000a0791158e7c4e27b', 'alipay'),(26, 37, 6, '019dee38621670008284ac922a33bb46', 'pc', 12899.00, '1', '2026050322001465370508924875', '{"sign": "UFU/BzKWWwpu6EBW1ZatCSQP+q7aLjr7iXhsVxKTfMItPFsOVob1lgFiHNIngd9zoeu5nBRJ3xcUJZbhxHp06NieE/dNgehuJNZc7HHtAdeewwYBg+8NnN1tC+cJcXDqdffpSrgrkiGijEqdAiH1V5YifaAzynNFyRSupfG1JpDeJRCa/OPELfQ+uF29St+XPzJlgy2cgiAQg2zoi+IktQPEd5rn6ieNEtInW6SrucdZQBWsRuIswQgAPFRR5Wss2R1Q5pHHl7DaKNYTUq3yhfrpM7cnNJoUebYwCIISAQ5RN1vg5qTcF/S1kupALmSKSY+zkE7TOughqghxC4dSjw==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026050322001465370508924875", "notify_id": "2026050301222222336165370508934730", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-03 22:23:28", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-03 22:23:36", "notify_time": "2026-05-03 22:23:37", "notify_type": "trade_status_sync", "out_trade_no": "019dee38621670008284ac922a33bb46", "point_amount": "0.00", "total_amount": "12899.00", "trade_status": "TRADE_SUCCESS", "fund_bill_list": "[{\"amount\":\"12899.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "12899.00", "receipt_amount": "12899.00", "buyer_pay_amount": "12899.00"}', '2026-05-03 14:22:45.786859+00', '1', '2026-05-03 14:29:11.362+00', NULL, 'f', NULL, '019dee3830c77000bbb4d2f7230574b6', 'alipay'),(25, 36, 6, '019dee36250c7000bc87515e4a0e5a0f', 'pc', 0.00, '3', NULL, '{}', '2026-05-03 14:20:19.088194+00', '1', NULL, NULL, 'f', NULL, '019dee360a887000b1db1412f9c8bc32', 'alipay'),(27, 39, 6, '019df2d98b1f700089c71e34b3934b93', 'pc', 0.00, '0', NULL, '{}', '2026-05-04 11:57:16.450634+00', '1', NULL, NULL, 'f', NULL, '019df2c9889f7000880a1f2a4969fb1d', 'alipay'),(34, 47, 6, '019df74f123e70008736b950f82d316a', 'h5', 25698.00, '1', '2026050522001465370508935287', '{"sign": "f60eavHI+48CMx5MR9hUUy8TuHkoKSTEvw+wpLbpIPHv+/AJZM066TXKzVmvW9nBTUe9PrS5RO/RU7rY1yrszfkaZT/fUueFW7VOIMUKJ5jS3bSbAs6t/ja+xWO12Q+kCq4Ju0ZTloS2CiC/ZgKe9qIwWdOmbLZeeIWYbqp+Ng7IWpjZ0jrYYi0RauVl2qJsl51G6awyg2SZ5+OZ1Le0cvPAkjjR9WWoOZHK9Q6CyfMqU4KQnUj2VdgW/o6Ai7QD8D0tYMk3a0FMPoMeqt4i6rY8UvHiMt4FoqDJNiZjDewkyrVV2ld0i18V0s7YDS67keiT0/RBR2gaf+b/kwpBvw==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026050522001465370508935287", "notify_id": "2026050501222164551165370508945448", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-05 16:45:49", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-05 16:45:50", "notify_time": "2026-05-05 16:45:52", "notify_type": "trade_status_sync", "out_trade_no": "019df74f123e70008736b950f82d316a", "point_amount": "0.00", "seller_email": "awobmv7611@sandbox.com", "total_amount": "25698.00", "trade_status": "TRADE_SUCCESS", "buyer_logon_id": "uhjhty8906@sandbox.com", "fund_bill_list": "[{\"amount\":\"25698.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "25698.00", "receipt_amount": "25698.00", "buyer_pay_amount": "25698.00"}', '2026-05-05 08:44:07.617818+00', '1', '2026-05-05 08:45:50.286+00', NULL, 'f', NULL, '019df74f007a7000a745dd7d169f2933', 'alipay'),(33, 46, 6, '019df74e8f1b7000b38859db37fefcec', 'h5', 0.00, '3', NULL, '{}', '2026-05-05 08:43:34.044799+00', '1', NULL, NULL, 'f', NULL, '019df74e37f47000afec7155fd731b1d', 'alipay'),(35, 49, 6, '019dfd6e886e70009018ef2cd78dedf0', 'app', 0.00, '3', NULL, '{}', '2026-05-06 13:16:12.785779+00', '1', NULL, NULL, 'f', NULL, '019dfd6e5fe97000a5e9e9fcc76ec9e3', 'alipay'),(36, 50, 6, '019dfd7b6d077000b8b28f6170b986d9', 'app', 0.00, '3', NULL, '{}', '2026-05-06 13:30:17.737125+00', '1', NULL, NULL, 'f', NULL, '019dfd7b48327000b1b75bc17b852b7c', 'alipay'),(37, 51, 6, '019dfd7bd7d270009b55f9a49cac94d7', 'app', 0.00, '3', NULL, '{}', '2026-05-06 13:30:45.07556+00', '1', NULL, NULL, 'f', NULL, '019dfd7bb48770009ac152588fe6c79f', 'alipay'),(38, 52, 6, '019e0259e76170009f149d96f1987a94', 'app', 0.00, '3', NULL, '{}', '2026-05-07 12:11:46.916557+00', '1', NULL, NULL, 'f', NULL, '019e02599d1b7000a9e222d8848e5338', 'alipay'),(39, 53, 6, '019e0cd8f59170008380f953274c36b4', 'pc', 0.00, '3', NULL, '{}', '2026-05-09 13:06:45.784164+00', '1', NULL, NULL, 'f', NULL, '019e0cd850ba7000aed3bcfd4076c7d3', 'alipay'),(40, 54, 6, '019e0cdd045a70008c02059379a0f173', 'pc', 0.00, '3', NULL, '{}', '2026-05-09 13:11:11.709446+00', '1', NULL, NULL, 'f', NULL, '019e0cdce9747000a3824c22fe0761c5', 'alipay'),(41, 55, 6, '019e0cdf68f270009ec91abaf58dbb31', 'pc', 25698.00, '1', '2026050922001465370508958527', '{"sign": "h5DCNG3XEAfQeUxAGMicbryU4ZnLbU8irMoBzncN5Pu1XppZzuP+6GWIVEqPTCYlFUIKothqCs33J+k4zAKQVLGvME8WlVV6t5ThpCWFrEWzWWt9yjLSDwCtebNKa/iyBx+dnI1oNChVh/f0ZNsGUZXkloQAYH08lx6AbM1BurJkcY9EHYVURiOgs5H9zZe8ll30X5+HZaj0s0FYS3rikBszQZ68Lpvacc6oymIgzs3siRTkNlLQbDlGZ9e0zQhUOpINyMhYAe17bWm7qwh+lPf2cLmqZH1TKfMZbP1oHW9LHEppdBffAfSI/T8dVUWhWFHWUAfN1aaLKRzxNIFGdw==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026050922001465370508958527", "notify_id": "2026050901222211411165370508967967", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-09 21:14:01", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-09 21:14:10", "notify_time": "2026-05-09 21:14:11", "notify_type": "trade_status_sync", "out_trade_no": "019e0cdf68f270009ec91abaf58dbb31", "point_amount": "0.00", "total_amount": "25698.00", "trade_status": "TRADE_SUCCESS", "fund_bill_list": "[{\"amount\":\"25698.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "25698.00", "receipt_amount": "25698.00", "buyer_pay_amount": "25698.00"}', '2026-05-09 13:13:48.534167+00', '1', '2026-05-09 13:14:12.716+00', NULL, 'f', NULL, '019e0cdf2ea0700099dc46c21de5137d', 'alipay'),(42, 56, 6, '019e101e5b28700081da14bc6bc1a57a', 'pc', 25698.00, '1', '2026051022001465370508962984', '{"sign": "iRgT/OkK/KFPhUX+jFYLWwOC5RRrWL8tt5L8IBt9mmXzf4m/WEqdVoqnD0FeFIYzttDCQ9UAoq3hEElQ4IPv/MsRcxawIm6tdivY/02AsDtizxSfvXpuD4GZs+sxcOzvLpHIBVG3c9u4wuDyv1Nrb+iyyvx55mI1Lo3kZtOqLye9zJUeGYv9n3n5AlYoEILHpJVufFyUOQ609d+SSUfAApWdxwjxSpCzd7epYkygI0xzdVzBT9F9r7Do57XzvbmPbJGmMQWzbscCJGCI2dCjL8fK01oebRTDnH5JFKcpEreZmD7aQkUWvJHo2QSsunJmROjg08LfizBrhysQ/1AZKw==", "app_id": "9021000140654564", "charset": "utf-8", "subject": "DR钻戒-求婚系列", "version": "1.0", "buyer_id": "2088722043665373", "trade_no": "2026051022001465370508962984", "notify_id": "2026051001222122204165370508973274", "seller_id": "2088721043665361", "sign_type": "RSA2", "gmt_create": "2026-05-10 12:21:57", "auth_app_id": "9021000140654564", "gmt_payment": "2026-05-10 12:22:04", "notify_time": "2026-05-10 12:22:05", "notify_type": "trade_status_sync", "out_trade_no": "019e101e5b28700081da14bc6bc1a57a", "point_amount": "0.00", "total_amount": "25698.00", "trade_status": "TRADE_SUCCESS", "fund_bill_list": "[{\"amount\":\"25698.00\",\"fundChannel\":\"ALIPAYACCOUNT\"}]", "invoice_amount": "25698.00", "receipt_amount": "25698.00", "buyer_pay_amount": "25698.00"}', '2026-05-10 04:21:25.417714+00', '1', '2026-05-10 04:22:04.27+00', NULL, 'f', NULL, '019e101dcea4700088413b734efc7b6d', 'alipay')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."business_refund" IN SHARE MODE;
DELETE FROM "public"."business_refund";
COMMIT;
BEGIN;
LOCK TABLE "public"."monitor_job" IN SHARE MODE;
DELETE FROM "public"."monitor_job";
INSERT INTO "public"."monitor_job" ("job_id","job_name","job_cron","status","create_time","create_by","update_time","update_by","del_flag","remark","job_args") VALUES (8, '测试任务', '0 * * * * *', 't', '2026-02-10 02:17:20.145+00', NULL, '2026-04-14 09:37:18.209+00', '1', 'f', '', '["乔治",19,true]')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_api" IN SHARE MODE;
DELETE FROM "public"."system_api";
INSERT INTO "public"."system_api" ("api_id","api_name","api_path","api_method","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (548, '认证模块-web账号密码登录', '/api/auth/login', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(549, '认证模块-刷新令牌', '/api/auth/refresh', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(550, '认证模块-注册用户', '/api/auth/register', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(551, '认证模块-忘记密码', '/api/auth/forget', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(552, '认证模块-重置密码', '/api/auth/reset-password', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(553, '支付模块-支付同步回调', '/api/business/payments/return', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(554, '支付模块-支付异步回调', '/api/business/payments/notify', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(555, '系统字典-查询所有-缓存数据', '/api/system/dict/data/all', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(556, '认证模块-退出登录', '/api/auth/logout', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(557, '商户模块-创建', '/api/business/merchant', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(558, '商户模块-创建商户配置', '/api/business/merchant/config', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(559, '商户模块-查询商户配置', '/api/business/merchant/config/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(560, '商户模块-查询列表', '/api/business/merchant/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(561, '商户模块-更新', '/api/business/merchant', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(562, '商户模块-更新商户配置', '/api/business/merchant/config', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(563, '商户模块-删除', '/api/business/merchant/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(564, '商户模块-删除商户配置', '/api/business/merchant/config/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(565, '订单模块-创建', '/api/business/orders', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(566, '订单模块-查询列表', '/api/business/orders/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(567, '订单模块-状态统计', '/api/business/orders/stats', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(568, '订单模块-查询详情', '/api/business/orders/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(569, '订单模块-更新', '/api/business/orders', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(570, '支付模块-支付订单', '/api/business/payments', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(571, '退款模块-创建', '/api/business/refund', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(572, '退款模块-更新', '/api/business/refund', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(573, '缓存列表-查询类型', '/api/monitor/cache/type', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(574, '缓存列表-查询列表', '/api/monitor/cache/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(575, '缓存列表-查询详情', '/api/monitor/cache/key', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(576, '缓存列表-更新指定缓存', '/api/monitor/cache/update-key', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(577, '缓存列表-清除指定类型', '/api/monitor/cache/clear-type', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(578, '缓存列表-清除指定缓存', '/api/monitor/cache/clear-key', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(579, '定时任务-创建', '/api/monitor/job', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(580, '定时任务-查询列表', '/api/monitor/job/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(581, '定时任务-更新', '/api/monitor/job', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(582, '定时任务-删除', '/api/monitor/job/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(583, '在线用户-查询列表', '/api/monitor/online/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(584, '在线用户-强退', '/api/monitor/online/forceLogout/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(585, '队列监控-查询队列列表', '/api/monitor/queue/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(586, '队列监控-查询任务列表', '/api/monitor/queue/jobs', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(587, '队列监控-查询任务详情', '/api/monitor/queue/job', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(588, '队列监控-重试失败任务', '/api/monitor/queue/job/retry', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(589, '队列监控-删除任务', '/api/monitor/queue/job', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(590, '队列监控-清空队列任务', '/api/monitor/queue/clean', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(591, '队列监控-暂停或恢复队列', '/api/monitor/queue/pause', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(592, '队列监控-批量重试失败任务', '/api/monitor/queue/jobs/retry-all', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(593, '队列监控-立即执行延迟任务', '/api/monitor/queue/job/promote', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(594, '队列监控-批量立即执行延迟任务', '/api/monitor/queue/jobs/promote-all', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(595, '系统API-创建', '/api/system/api', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(596, '系统API-查询列表', '/api/system/api/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(597, '系统API-查询详情', '/api/system/api/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(598, '系统API-更新', '/api/system/api', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(599, '系统API-删除', '/api/system/api/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(600, '系统部门-创建', '/api/system/dept', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(601, '系统部门-查询部门树', '/api/system/dept/tree', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(602, '系统部门-下拉选项数据', '/api/system/dept/options', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(603, '系统部门-更新', '/api/system/dept', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(604, '系统部门-删除', '/api/system/dept/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(605, '系统字典-创建-类型', '/api/system/dict/type', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(606, '系统字典-查询所有-缓存类型', '/api/system/dict/type/all', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(607, '系统字典-查询列表-类型', '/api/system/dict/type/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(608, '系统字典-查询详情-类型', '/api/system/dict/type/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(609, '系统字典-更新-类型', '/api/system/dict/type', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(610, '系统字典-删除-类型', '/api/system/dict/type/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(611, '系统字典-创建-数据', '/api/system/dict/data', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(612, '系统字典-查询列表-数据', '/api/system/dict/data/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(613, '系统字典-更新-数据', '/api/system/dict/data', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(614, '系统字典-删除-数据', '/api/system/dict/data/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(615, '黑名单IP-创建', '/api/system/ip-black', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(616, '黑名单IP-查询全部', '/api/system/ip-black/all', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(617, '黑名单IP-更新', '/api/system/ip-black', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(618, '黑名单IP-删除', '/api/system/ip-black/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(619, '登录日志-查询列表', '/api/system/login-log/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(620, '登录日志-删除', '/api/system/login-log/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(621, '系统菜单-创建菜单', '/api/system/menu', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(622, '系统菜单-查询用户菜单树', '/api/system/menu/simple', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(623, '系统菜单-查询完整菜单树', '/api/system/menu/tree', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(624, '系统菜单-查询菜单详情', '/api/system/menu/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(625, '系统菜单-更新菜单', '/api/system/menu', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(626, '系统菜单-删除菜单', '/api/system/menu/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(627, '系统菜单-创建按钮', '/api/system/menu/btn', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(628, '系统菜单-更新按钮', '/api/system/menu/btn', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(629, '系统菜单-删除按钮', '/api/system/menu/btn/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(630, '操作日志-查询列表', '/api/system/oper-log/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(631, '操作日志-删除', '/api/system/oper-log/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(632, '系统角色-创建', '/api/system/role', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(633, '系统角色-查询列表', '/api/system/role/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(634, '系统角色-下拉选项数据', '/api/system/role/options', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(635, '系统角色-查询角色权限', '/api/system/role/permission/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(636, '系统角色-查询详情', '/api/system/role/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(637, '系统角色-更新', '/api/system/role', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(638, '系统角色-更新角色权限', '/api/system/role/permission', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(639, '系统角色-删除', '/api/system/role/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(640, '存储配置-创建', '/api/system/storage', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(641, '存储配置-查询列表', '/api/system/storage/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(642, '存储配置-生成预签名URL', '/api/system/storage/presign', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(643, '存储配置-更新', '/api/system/storage', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(644, '存储配置-删除', '/api/system/storage/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(645, '系统用户-创建', '/api/system/user', '2', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(646, '系统用户-查询列表', '/api/system/user/list', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(647, '系统用户-查询个人基本权限', '/api/system/user/perm', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(648, '系统用户-查询个人基本信息', '/api/system/user/basic', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(649, '系统用户-查询详情', '/api/system/user/:id', '1', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(650, '系统用户-更新', '/api/system/user', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(651, '系统用户-更新个人基本信息', '/api/system/user/basic', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(652, '系统用户-更新个人密码', '/api/system/user/password', '3', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL),(653, '系统用户-删除', '/api/system/user/:ids', '4', 't', '2026-06-10 08:33:55.087343+00', NULL, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dept" IN SHARE MODE;
DELETE FROM "public"."system_dept";
INSERT INTO "public"."system_dept" ("dept_id","dept_name","status","parent_id","create_time","create_by","update_time","update_by","del_flag","remark","sort") VALUES (1, 'Elysia-Admin科技', 't', 0, '2025-12-31 05:30:19.896242+00', NULL, NULL, NULL, 'f', NULL, 0),(2, '长沙总公司', 't', 1, '2025-12-31 05:38:35.375031+00', NULL, NULL, NULL, 'f', NULL, 0),(3, '杭州分公司', 't', 1, '2025-12-31 05:38:44.9+00', NULL, '2025-12-31 09:23:34.735+00', NULL, 'f', '', 0),(4, '研发部门', 't', 2, '2025-12-31 09:27:56.164569+00', NULL, NULL, NULL, 'f', NULL, 0),(5, '市场部门', 't', 2, '2026-01-06 07:57:35.255585+00', NULL, NULL, NULL, 'f', NULL, 0),(6, '测试部门', 't', 2, '2026-01-06 07:58:01.206845+00', NULL, NULL, NULL, 'f', NULL, 0),(7, '财务部门', 't', 2, '2026-01-06 07:58:15.84004+00', NULL, NULL, NULL, 'f', NULL, 0),(8, '运维部门', 't', 2, '2026-01-06 07:58:24.001631+00', NULL, '2026-01-06 08:03:57.027+00', NULL, 'f', NULL, 0),(9, '测试公司', 't', 1, '2026-04-18 01:37:38.993102+00', '1', NULL, NULL, 'f', '', 0)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_data" IN SHARE MODE;
DELETE FROM "public"."system_dict_data";
INSERT INTO "public"."system_dict_data" ("dict_code","dict_sort","dict_value","dict_label","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark","tag_type","custom_class") VALUES (1, 0, '0', '未知', 'system_user_sex', 't', '2025-12-15 07:26:11.870532+00', NULL, NULL, NULL, 'f', NULL, NULL, NULL),(2, 1, '1', '男', 'system_user_sex', 't', '2025-12-15 07:26:20.125+00', NULL, '2025-12-22 07:06:06.339+00', NULL, 'f', NULL, NULL, NULL),(3, 2, '2', '女', 'system_user_sex', 't', '2025-12-15 07:26:26.649+00', NULL, '2025-12-22 07:06:10.191+00', NULL, 'f', NULL, NULL, NULL),(4, 0, '0', '系统通知', 'system_notice_type', 't', '2025-12-22 06:18:34.393991+00', NULL, '2025-12-22 07:42:26.789+00', NULL, 'f', NULL, NULL, NULL),(8, 0, '4', 'DELETE', 'api_request_method', 't', '2025-12-24 07:44:27.425+00', NULL, '2025-12-29 03:00:48.842+00', NULL, 'f', '', 'danger', ''),(7, 0, '3', 'PUT', 'api_request_method', 't', '2025-12-24 07:44:18.668+00', NULL, '2025-12-29 03:01:00.962+00', NULL, 'f', '', 'warning', ''),(5, 0, '2', 'POST', 'api_request_method', 't', '2025-12-24 07:43:57.346+00', NULL, '2026-02-05 05:42:09.755+00', NULL, 'f', '', 'success', ''),(6, 0, '1', 'GET', 'api_request_method', 't', '2025-12-24 07:44:11.389+00', NULL, '2026-02-05 05:42:15.357+00', NULL, 'f', '', 'info', ''),(9, 0, 'admin', '管理员', 'system_user_type', 't', '2026-02-09 07:03:37.970308+00', NULL, NULL, NULL, 'f', '', 'danger', ''),(10, 0, 'user', '普通用户', 'system_user_type', 't', '2026-02-09 07:03:57.351573+00', NULL, NULL, NULL, 'f', '', 'info', ''),(18, 0, 'pc', 'PC', 'system_pay_platform', 't', '2026-03-27 01:39:08.742391+00', '1', NULL, NULL, 'f', '', 'primary', ''),(19, 0, 'h5', 'H5', 'system_pay_platform', 't', '2026-03-27 01:39:28.013588+00', '1', NULL, NULL, 'f', '', 'warning', ''),(20, 0, 'app', 'APP', 'system_pay_platform', 't', '2026-03-27 01:39:47.052235+00', '1', NULL, NULL, 'f', '', 'info', ''),(21, 0, 'mini', '小程序', 'system_pay_platform', 't', '2026-03-27 01:40:08.034721+00', '1', NULL, NULL, 'f', '', 'success', ''),(22, 0, '0', '待支付', 'system_pay_status', 't', '2026-03-27 01:51:08.357+00', '1', '2026-03-27 02:04:47.675+00', '1', 'f', '', 'info', ''),(23, 0, '1', '成功', 'system_pay_status', 't', '2026-03-27 01:51:20.684+00', '1', '2026-03-27 02:04:53.352+00', '1', 'f', '', 'success', ''),(24, 0, '2', '失败', 'system_pay_status', 't', '2026-03-27 01:52:29.779+00', '1', '2026-03-27 02:04:56.268+00', '1', 'f', '', 'danger', ''),(26, 0, '0', '退款中', 'system_refund_status', 't', '2026-03-27 02:08:08.284001+00', '1', NULL, NULL, 'f', '', 'info', ''),(27, 0, '1', '成功', 'system_refund_status', 't', '2026-03-27 02:08:57.338089+00', '1', NULL, NULL, 'f', '', 'success', ''),(28, 0, '2', '失败', 'system_refund_status', 't', '2026-03-27 02:09:06.075658+00', '1', '2026-03-27 02:15:50.106+00', '1', 'f', '', 'danger', ''),(29, 0, 'alipay', '支付宝', 'system_pay_method', 't', '2026-03-31 01:22:12.03037+00', '1', '2026-03-31 06:35:36.634+00', '1', 'f', 'ri:alipay-fill', '', 'text-2xl text-blue-600'),(30, 1, 'wechat', '微信支付', 'system_pay_method', 't', '2026-03-31 01:22:44.8649+00', '1', '2026-03-31 07:27:19.672+00', '1', 'f', 'mingcute:wechat-pay-fill', '', 'text-2xl text-green-600'),(31, 2, 'paypal', 'PayPal', 'system_pay_method', 't', '2026-03-31 01:23:34.30506+00', '1', '2026-03-31 07:27:22.768+00', '1', 'f', 'logos:paypal', '', 'text-2xl'),(14, 0, '0', '待支付', 'system_orders_status', 't', '2026-03-25 02:24:50.104892+00', '1', '2026-04-09 03:03:02.517+00', '1', 'f', '', 'primary', ''),(15, 1, '1', '已支付', 'system_orders_status', 't', '2026-03-25 02:25:04.34673+00', '1', '2026-04-09 03:03:27.915+00', '1', 'f', '', 'success', ''),(16, 2, '2', '已取消', 'system_orders_status', 't', '2026-03-25 02:25:17.546746+00', '1', '2026-04-09 03:03:32.613+00', '1', 'f', '', 'warning', ''),(17, 3, '3', '已过期', 'system_orders_status', 't', '2026-03-25 02:25:28.405897+00', '1', '2026-04-09 03:03:47.283+00', '1', 'f', '', 'info', ''),(32, 4, '4', '已退款', 'system_orders_status', 't', '2026-04-09 03:04:02.205506+00', '1', NULL, NULL, 'f', '', 'danger', ''),(25, 0, '3', '已关闭', 'system_pay_status', 't', '2026-03-27 01:52:41.928+00', '1', '2026-04-09 03:05:00.534+00', '1', 'f', '', 'warning', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_type" IN SHARE MODE;
DELETE FROM "public"."system_dict_type";
INSERT INTO "public"."system_dict_type" ("dict_id","dict_name","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (1, '用户性别', 'system_user_sex', 't', '2025-12-15 07:22:45.589436+00', NULL, NULL, NULL, 'f', NULL),(2, '通知类型', 'system_notice_type', 't', '2025-12-22 06:12:58.98+00', NULL, '2025-12-22 07:04:21.064+00', NULL, 'f', NULL),(3, 'API请求方法', 'api_request_method', 't', '2025-12-24 07:40:36.046+00', NULL, '2026-01-07 03:19:12.302+00', NULL, 'f', NULL),(4, '系统用户类型', 'system_user_type', 't', '2026-02-09 07:02:58.958448+00', NULL, NULL, NULL, 'f', NULL),(6, '订单状态', 'system_orders_status', 't', '2026-03-25 02:24:21.477809+00', '1', NULL, NULL, 'f', NULL),(7, '支付平台', 'system_pay_platform', 't', '2026-03-27 01:38:19.136885+00', '1', NULL, NULL, 'f', NULL),(8, '支付状态', 'system_pay_status', 't', '2026-03-27 01:49:24.074547+00', '1', NULL, NULL, 'f', NULL),(9, '退款状态', 'system_refund_status', 't', '2026-03-27 02:04:14.939754+00', '1', NULL, NULL, 'f', NULL),(10, '支付类型', 'system_pay_method', 't', '2026-03-31 01:19:43.218103+00', '1', NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_ip_black" IN SHARE MODE;
DELETE FROM "public"."system_ip_black";
INSERT INTO "public"."system_ip_black" ("ip_black_id","ip_address","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (6, '192.168.2.3', 't', '2026-01-24 07:45:47.878+00', NULL, '2026-03-30 01:52:30.745+00', '1', 'f', '测试黑名单功能')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_login_log" IN SHARE MODE;
DELETE FROM "public"."system_login_log";
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu" IN SHARE MODE;
DELETE FROM "public"."system_menu";
INSERT INTO "public"."system_menu" ("menu_id","path","name","component","title","icon","show_badge","show_text_badge","is_hide","is_hide_tab","link","is_iframe","keep_alive","fixed_tab","create_time","create_by","update_time","update_by","del_flag","remark","active_path","sort","parent_id","status","is_full_page") VALUES (1, '/dashboard', 'Dashboard', '/index/index', 'menus.dashboard.title', 'ri:pie-chart-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:44:03.266366+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(2, 'console', 'Console', '/dashboard/console', 'menus.dashboard.console', 'ri:home-smile-2-line', 'f', NULL, 'f', 'f', NULL, 'f', 'f', 't', '2026-01-07 06:53:09.690864+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 1, 't', 'f'),(6, 'user-center', 'UserCenter', '/system/user-center', 'menus.system.userCenter', 'ri:user-line', 'f', NULL, 't', 't', NULL, 'f', 't', 'f', '2026-01-07 07:20:40.477837+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(7, 'menu', 'Menus', '/system/menu', 'menus.system.menu', 'ri:menu-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:21:53.540874+00', NULL, '2026-02-07 07:54:25.944+00', NULL, 'f', NULL, '', 2, 3, 't', 'f'),(8, 'dept', 'Dept', '/system/dept', 'menus.system.dept', 'material-symbols:groups-2-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:10.052595+00', NULL, '2026-02-07 07:54:30.697+00', NULL, 'f', NULL, '', 3, 3, 't', 'f'),(20, 'loginLog', 'LoginLog', '/system/log/loginlog', 'menus.system.loginLog', 'ri:login-circle-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:40:46.820945+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f'),(21, 'operLog', 'OperLog', '/system/log/operlog', 'menus.system.operLog', 'ri:settings-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:41:30.611732+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f'),(9, 'dict', 'Dict', '/system/dict', 'menus.system.dict', 'material-symbols:book-2-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:25.225276+00', NULL, '2026-02-07 07:54:36.764+00', NULL, 'f', NULL, '', 4, 3, 't', 'f'),(10, 'api', 'Api', '/system/api', 'menus.system.api', 'tabler:api', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:22:39.036648+00', NULL, '2026-02-07 07:54:44.057+00', NULL, 'f', NULL, '', 5, 3, 't', 'f'),(18, 'blacklist', 'Blacklist', '/system/blacklist', 'menus.system.blacklist', 'material-symbols:block-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-24 05:35:39.52242+00', NULL, '2026-02-07 07:54:50.803+00', NULL, 'f', NULL, '', 6, 3, 't', 'f'),(3, '/system', 'System', '/index/index', 'menus.system.title', 'ri:user-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 06:57:44.645285+00', NULL, '2026-02-11 07:00:27.571+00', NULL, 'f', NULL, '', 1, 0, 't', 'f'),(22, '/monitor', 'Monitor', '/index/index', 'menus.monitor.title', 'material-symbols:screenshot-monitor-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 06:54:25.075336+00', NULL, '2026-02-11 07:00:34.323+00', NULL, 'f', NULL, '', 2, 0, 't', 'f'),(27, 'storage', 'Storage', '/system/storage', 'menus.system.storage', 'material-symbols:folder-data-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-11 08:47:49.316326+00', NULL, '2026-02-11 08:52:33.669+00', NULL, 'f', NULL, '', 7, 3, 't', 'f'),(28, 'cache', 'Cache', '/monitor/cache', 'menus.monitor.cache', 'devicon-plain:redis', 'f', '', 'f', 'f', '', 'f', 'f', 'f', '2026-03-03 01:33:32.38431+00', NULL, NULL, NULL, 'f', NULL, '', 0, 22, 't', 'f'),(4, 'user', 'User', '/system/user', 'menus.system.user', 'ri:user-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:03:52.388903+00', NULL, '2026-02-07 07:19:41.863+00', NULL, 'f', NULL, '', 0, 3, 't', 'f'),(23, 'online', 'Online', '/monitor/online', 'menus.monitor.online', 'majesticons:status-online', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 07:27:32.894399+00', NULL, '2026-02-07 07:29:04.073+00', NULL, 'f', NULL, '', 1, 22, 't', 'f'),(24, 'job', 'Job', '/monitor/job', 'menus.monitor.job', 'material-symbols:emoji-food-beverage-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-02-07 07:43:57.396393+00', NULL, NULL, NULL, 'f', NULL, '', 2, 22, 't', 'f'),(5, 'role', 'Role', '/system/role', 'menus.system.role', 'ri:user-settings-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-07 07:05:15.131251+00', NULL, '2026-02-07 07:54:13.275+00', NULL, 'f', NULL, '', 1, 3, 't', 'f'),(26, '/outside/iframe/openapi', 'OpenApi', '', 'menus.outside.openapi', 'akar-icons:graphql-fill', 'f', '', 'f', 'f', 'http://localhost:3000/api/openapi', 't', 't', 'f', '2026-02-11 06:55:41.405065+00', NULL, '2026-03-30 02:53:22.697+00', '1', 'f', NULL, '', 4, 0, 't', 'f'),(29, '/business', 'Business', '/index/index', 'menus.business.title', 'ic:baseline-payment', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:56:03.153104+00', '1', '2026-03-30 03:24:37.636+00', '1', 'f', NULL, '', 3, 0, 't', 'f'),(30, 'merchant', 'Merchant', '/business/merchant', 'menus.business.merchant', 'material-symbols:lock-person-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:57:41.733813+00', '1', '2026-03-30 03:25:52.057+00', '1', 'f', NULL, '', 0, 29, 't', 'f'),(31, 'orders', 'Orders', '/business/orders', 'menus.business.orders', 'material-symbols:orders-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-03-30 02:58:17.068076+00', '1', '2026-03-30 03:29:38.503+00', '1', 'f', NULL, '', 1, 29, 't', 'f'),(19, 'log', 'Log', '', 'menus.system.log', 'ri:file-list-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:39:40.82449+00', NULL, '2026-04-14 02:13:20.475+00', '1', 'f', NULL, '', 9, 3, 't', 'f'),(36, 'payDebug', 'PayDebug', '/business/payDebug', 'menus.business.payDebug', 'ri:wallet-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-05-13 06:35:13.663875+00', '1', NULL, NULL, 'f', NULL, '', 2, 29, 't', 'f'),(34, 'bullmq', 'Bullmq', '/monitor/bullmq', 'menus.monitor.bullmq', 'mdi:bullseye-arrow', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-04-14 02:04:15.316618+00', '1', '2026-06-10 07:03:09.029214+00', '1', 'f', NULL, '', 3, 22, 't', 'f'),(37, 'analysis', 'Analysis', '/dashboard/analysis', 'menus.dashboard.analysis', 'ri:align-item-bottom-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-06-11 02:05:02.976768+00', '54c701c5-a704-424b-b1da-e43d07c50ee9', NULL, NULL, 'f', NULL, '', 1, 1, 't', 'f'),(38, 'ecommerce', 'Ecommerce', '/dashboard/ecommerce', 'menus.dashboard.ecommerce', 'ri:bar-chart-box-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-06-11 02:05:44.739753+00', '54c701c5-a704-424b-b1da-e43d07c50ee9', NULL, NULL, 'f', NULL, '', 2, 1, 't', 'f')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu_btn" IN SHARE MODE;
DELETE FROM "public"."system_menu_btn";
INSERT INTO "public"."system_menu_btn" ("menu_id","sort","title","permission","create_time","create_by","update_time","update_by","del_flag","remark","btn_id","status") VALUES (7, 0, '编辑', 'system:menu:update', '2026-01-10 06:00:05.075948+00', NULL, NULL, NULL, 'f', NULL, 2, 't'),(7, 0, '删除', 'system:menu:delete', '2026-01-10 06:00:44.132664+00', NULL, NULL, NULL, 'f', NULL, 3, 't'),(7, 0, '查询', 'system:menu:query', '2026-01-10 06:02:04.390263+00', NULL, NULL, NULL, 'f', NULL, 5, 't'),(7, 1, '新增', 'system:menu:create', '2026-01-10 05:59:43.793701+00', NULL, '2026-01-10 08:23:43.01+00', NULL, 'f', NULL, 1, 't'),(8, 0, '新增', 'system:dept:create', '2026-01-10 08:37:59.572615+00', NULL, NULL, NULL, 'f', NULL, 9, 't'),(8, 0, '删除', 'system:dept:delete', '2026-01-10 08:38:57.597483+00', NULL, NULL, NULL, 'f', NULL, 10, 't'),(8, 0, '更新', 'system:dept:update', '2026-01-10 08:39:12.67185+00', NULL, NULL, NULL, 'f', NULL, 11, 't'),(8, 0, '查询', 'system:dept:query', '2026-01-10 08:39:27.121017+00', NULL, NULL, NULL, 'f', NULL, 12, 't'),(10, 0, '查询', 'system:api:query', '2026-01-10 08:40:18.466495+00', NULL, NULL, NULL, 'f', NULL, 14, 't'),(10, 0, '更新', 'system:api:update', '2026-01-10 08:40:34.207498+00', NULL, NULL, NULL, 'f', NULL, 15, 't'),(10, 0, '删除', 'system:api:delete', '2026-01-10 08:40:45.232152+00', NULL, NULL, NULL, 'f', NULL, 16, 't'),(9, 0, '新增类型', 'system:dict:type:create', '2026-01-10 08:41:15.252098+00', NULL, NULL, NULL, 'f', NULL, 17, 't'),(9, 0, '新增数据', 'system:dict:data:create', '2026-01-10 08:41:36.205116+00', NULL, NULL, NULL, 'f', NULL, 18, 't'),(9, 0, '查询类型', 'system:dict:type:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 19, 't'),(9, 0, '查询数据', 'system:dict:data:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 20, 't'),(9, 0, '更新类型', 'system:dict:type:update', '2026-01-10 08:45:27.870497+00', NULL, NULL, NULL, 'f', NULL, 21, 't'),(9, 0, '更新数据', 'system:dict:data:update', '2026-01-10 08:45:45.848287+00', NULL, NULL, NULL, 'f', NULL, 22, 't'),(9, 0, '删除类型', 'system:dict:type:delete', '2026-01-10 08:46:09.840199+00', NULL, NULL, NULL, 'f', NULL, 23, 't'),(9, 0, '删除数据', 'system:dict:data:delete', '2026-01-10 08:46:22.050204+00', NULL, NULL, NULL, 'f', NULL, 24, 't'),(10, 0, '新增', 'system:api:create', '2026-01-10 08:40:02.457593+00', NULL, '2026-01-10 08:47:05.708+00', NULL, 'f', NULL, 13, 't'),(4, 0, '新增', 'system:user:create', '2026-01-31 08:25:15.877116+00', NULL, NULL, NULL, 'f', NULL, 25, 't'),(4, 0, '查询', 'system:user:query', '2026-01-31 08:25:34.533779+00', NULL, NULL, NULL, 'f', NULL, 26, 't'),(4, 0, '编辑', 'system:user:update', '2026-01-31 08:25:46.97912+00', NULL, NULL, NULL, 'f', NULL, 27, 't'),(4, 0, '删除', 'system:user:delete', '2026-01-31 08:25:59.978634+00', NULL, NULL, NULL, 'f', NULL, 28, 't'),(5, 0, '新增', 'system:role:create', '2026-01-31 08:26:58.242896+00', NULL, NULL, NULL, 'f', NULL, 29, 't'),(5, 0, '查询', 'system:role:query', '2026-01-31 08:27:15.553667+00', NULL, NULL, NULL, 'f', NULL, 30, 't'),(5, 0, '编辑', 'system:role:update', '2026-01-31 08:27:28.725263+00', NULL, NULL, NULL, 'f', NULL, 31, 't'),(5, 0, '删除', 'system:role:delete', '2026-01-31 08:27:47.884927+00', NULL, NULL, NULL, 'f', NULL, 32, 't'),(18, 0, '新增', 'system:ip-black:create', '2026-01-31 08:31:53.257359+00', NULL, NULL, NULL, 'f', NULL, 33, 't'),(18, 0, '查询', 'system:ip-black:query', '2026-01-31 08:32:10.402536+00', NULL, NULL, NULL, 'f', NULL, 34, 't'),(18, 0, '编辑', 'system:ip-black:update', '2026-01-31 08:32:24.058834+00', NULL, NULL, NULL, 'f', NULL, 35, 't'),(18, 0, '删除', 'system:ip-black:delete', '2026-01-31 08:32:37.241391+00', NULL, NULL, NULL, 'f', NULL, 36, 't'),(20, 0, '查询', 'system:login-log:query', '2026-01-31 08:42:39.4695+00', NULL, NULL, NULL, 'f', NULL, 37, 't'),(20, 0, '删除', 'system:login-log:delete', '2026-01-31 08:42:56.434237+00', NULL, NULL, NULL, 'f', NULL, 38, 't'),(21, 0, '查询', 'system:oper-log:query', '2026-01-31 08:43:23.224565+00', NULL, NULL, NULL, 'f', NULL, 39, 't'),(21, 0, '删除', 'system:oper-log:delete', '2026-01-31 08:43:40.619376+00', NULL, NULL, NULL, 'f', NULL, 40, 't'),(23, 0, '查询', 'monitor:online:query', '2026-02-09 06:59:11.207295+00', NULL, NULL, NULL, 'f', NULL, 41, 't'),(23, 0, '强退', 'monitor:online:forceLogout', '2026-02-09 06:59:35.503879+00', NULL, NULL, NULL, 'f', NULL, 42, 't'),(24, 0, '新增', 'monitor:job:create', '2026-02-11 05:48:22.486126+00', NULL, NULL, NULL, 'f', NULL, 43, 't'),(24, 0, '查询', 'monitor:job:query', '2026-02-11 05:48:34.775951+00', NULL, NULL, NULL, 'f', NULL, 44, 't'),(24, 0, '编辑', 'monitor:job:update', '2026-02-11 05:48:46.819656+00', NULL, NULL, NULL, 'f', NULL, 45, 't'),(24, 0, '删除', 'monitor:job:delete', '2026-02-11 05:48:56.613909+00', NULL, NULL, NULL, 'f', NULL, 46, 't'),(27, 0, '新增', 'system:storage:create', '2026-02-11 08:53:02.046018+00', NULL, NULL, NULL, 'f', NULL, 47, 't'),(27, 0, '查询', 'system:storage:query', '2026-02-11 08:53:17.118081+00', NULL, NULL, NULL, 'f', NULL, 48, 't'),(27, 0, '编辑', 'system:storage:update', '2026-02-11 08:53:31.450493+00', NULL, NULL, NULL, 'f', NULL, 49, 't'),(27, 0, '删除', 'system:storage:delete', '2026-02-11 08:53:45.693872+00', NULL, NULL, NULL, 'f', NULL, 50, 't'),(28, 0, '查询', 'monitor:cache:query', '2026-03-03 01:35:55.431547+00', NULL, NULL, NULL, 'f', NULL, 51, 't'),(28, 0, '编辑', 'monitor:cache:update', '2026-03-03 01:36:10.389632+00', NULL, NULL, NULL, 'f', NULL, 52, 't'),(28, 0, '删除', 'monitor:cache:delete', '2026-03-03 01:36:27.703191+00', NULL, NULL, NULL, 'f', NULL, 53, 't'),(30, 0, '新增', 'business:merchant:create', '2026-03-31 01:28:29.717474+00', '1', NULL, NULL, 'f', NULL, 54, 't'),(30, 0, '查询', 'business:merchant:query', '2026-03-31 01:28:47.817944+00', '1', NULL, NULL, 'f', NULL, 55, 't'),(30, 0, '删除', 'business:merchant:delete', '2026-03-31 01:29:16.295828+00', '1', NULL, NULL, 'f', NULL, 57, 't'),(30, 0, '编辑', 'business:merchant:update', '2026-03-31 01:29:04.494807+00', '1', '2026-03-31 01:29:23.831+00', '1', 'f', NULL, 56, 't'),(31, 0, '查询', 'business:orders:query', '2026-04-01 01:19:23.595395+00', '1', NULL, NULL, 'f', NULL, 58, 't'),(31, 0, '更新', 'business:orders:update', '2026-04-01 01:19:40.919376+00', '1', NULL, NULL, 'f', NULL, 59, 't'),(34, 0, '查询', 'monitor:queue:query', '2026-06-10 06:17:25.979426+00', NULL, NULL, NULL, 'f', NULL, 61, 't'),(34, 0, '重试', 'monitor:queue:retry', '2026-06-10 06:17:25.979426+00', NULL, NULL, NULL, 'f', NULL, 62, 't'),(34, 0, '删除', 'monitor:queue:delete', '2026-06-10 06:17:25.979426+00', NULL, NULL, NULL, 'f', NULL, 63, 't'),(34, 0, '清空', 'monitor:queue:clean', '2026-06-10 06:17:25.979426+00', NULL, NULL, NULL, 'f', NULL, 64, 't'),(34, 0, '暂停', 'monitor:queue:pause', '2026-06-10 07:03:09.029214+00', NULL, NULL, NULL, 'f', NULL, 65, 't'),(34, 0, '提升', 'monitor:queue:promote', '2026-06-10 07:03:09.029214+00', NULL, NULL, NULL, 'f', NULL, 66, 't')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_oper_log" IN SHARE MODE;
DELETE FROM "public"."system_oper_log";
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
INSERT INTO "public"."system_role_menu" ("role_id","menu_id","menu_btn_id") VALUES (2, 1, NULL),(2, 2, NULL),(1, 1, NULL),(1, 2, NULL),(1, 37, NULL),(1, 38, NULL),(1, 3, NULL),(1, 4, NULL),(1, 4, 25),(1, 4, 26),(1, 4, 27),(1, 4, 28),(1, 6, NULL),(1, 5, NULL),(1, 5, 29),(1, 5, 30),(1, 5, 31),(1, 5, 32),(1, 7, NULL),(1, 7, 2),(1, 7, 3),(1, 7, 5),(1, 7, 1),(1, 8, NULL),(1, 8, 9),(1, 8, 10),(1, 8, 11),(1, 8, 12),(1, 9, NULL),(1, 9, 17),(1, 9, 18),(1, 9, 19),(1, 9, 20),(1, 9, 21),(1, 9, 22),(1, 9, 23),(1, 9, 24),(1, 10, NULL),(1, 10, 14),(1, 10, 15),(1, 10, 16),(1, 10, 13),(1, 18, NULL),(1, 18, 33),(1, 18, 34),(1, 18, 35),(1, 18, 36),(1, 27, NULL),(1, 27, 47),(1, 27, 48),(1, 27, 49),(1, 27, 50),(1, 19, NULL),(1, 20, NULL),(1, 20, 37),(1, 20, 38),(1, 21, NULL),(1, 21, 39),(1, 21, 40),(1, 22, NULL),(1, 28, NULL),(1, 28, 51),(1, 28, 52),(1, 28, 53),(1, 23, NULL),(1, 23, 41),(1, 23, 42),(1, 24, NULL),(1, 24, 43),(1, 24, 44),(1, 24, 45),(1, 24, 46),(1, 34, NULL),(1, 34, 61),(1, 34, 62),(1, 34, 63),(1, 34, 64),(1, 34, 65),(1, 34, 66),(1, 29, NULL),(1, 30, NULL),(1, 30, 54),(1, 30, 55),(1, 30, 57),(1, 30, 56),(1, 31, NULL),(1, 31, 58),(1, 31, 59),(1, 36, NULL),(1, 26, NULL)
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
INSERT INTO "public"."system_user" ("username","password","nickname","email","phone","sex","avatar","create_time","create_by","update_time","update_by","del_flag","remark","status","dept_id","user_id") VALUES ('xiaomei', '$2b$10$ZVclyurmYrDZqiZE.L2/H.PCKgTENOM9u0Hh2zNv/QjvtnMrNgxhy', '罗德风', '2652365944@qq.com', NULL, '0', NULL, '2025-12-16 02:36:49.177028+00', NULL, NULL, NULL, 'f', NULL, 't', NULL, 'c5040fe6-4b13-4233-a966-183a2b305841'),('admin123', '$2b$10$a5yygkWI2t3HZxGDqP3Ifej15jK/OyZ6eC4iL.c4x/QpmrLfeEbOa', '老妖', '423235235@qq.com', '19890987675', '1', NULL, '2026-02-04 06:39:33.443815+00', NULL, NULL, NULL, 'f', NULL, 't', 1, '5027b3f9-4b9a-4834-8a4c-b918aec73fd8'),('qiaozhi', '$2b$10$6OiXvq9fYO.WS214b3m79e0UC4yk9cCftFUc4AKKBW/EcGuXxKwRu', '乔治', '43242@qq.com', '19898767656', '1', NULL, '2026-02-03 06:19:16.744+00', NULL, NULL, NULL, 'f', NULL, 't', 8, '456b810e-7aed-42a3-a15c-54b33d0fa864'),('admin', '$2b$10$YfJS21FBqTmpM4pc8I0j.uXX5rnhEiDM76Bm4u2h0mLzStfdFXgTi', '梅山老妖', '1360658549@qq.com', '19899999999', '0', '', '2025-12-12 08:41:41.858+00', NULL, '2026-02-06 03:34:28.268+00', NULL, 'f', '专注于用户体验跟视觉设计', 't', 4, '54c701c5-a704-424b-b1da-e43d07c50ee9')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user_role" IN SHARE MODE;
DELETE FROM "public"."system_user_role";
INSERT INTO "public"."system_user_role" ("role_id","user_id") VALUES (3, '5027b3f9-4b9a-4834-8a4c-b918aec73fd8'),(2, '5027b3f9-4b9a-4834-8a4c-b918aec73fd8'),(2, '456b810e-7aed-42a3-a15c-54b33d0fa864'),(3, '456b810e-7aed-42a3-a15c-54b33d0fa864'),(1, '54c701c5-a704-424b-b1da-e43d07c50ee9'),(2, '54c701c5-a704-424b-b1da-e43d07c50ee9'),(3, '54c701c5-a704-424b-b1da-e43d07c50ee9')
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
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_order_no_unique" UNIQUE ("order_no");
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_merchant_config_id_business_merchant_id_fk" FOREIGN KEY ("merchant_config_id") REFERENCES "public"."business_merchant" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_order_id_business_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."business_orders" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "business_payments" ADD CONSTRAINT "business_payments_order_no_business_orders_order_no_fk" FOREIGN KEY ("order_no") REFERENCES "public"."business_orders" ("order_no") ON DELETE NO ACTION ON UPDATE NO ACTION;
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
SELECT setval('"business_orders_id_seq"', 58, true);
ALTER SEQUENCE "business_orders_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "business_payments_id_seq"
OWNED BY "business_payments"."id";
SELECT setval('"business_payments_id_seq"', 42, true);
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
SELECT setval('"system_api_api_id_seq"', 653, true);
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
SELECT setval('"system_login_log_log_id_seq"', 227, true);
ALTER SEQUENCE "system_login_log_log_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_btn_btn_id_seq"
OWNED BY "system_menu_btn"."btn_id";
SELECT setval('"system_menu_btn_btn_id_seq"', 66, true);
ALTER SEQUENCE "system_menu_btn_btn_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_menu_id_seq"
OWNED BY "system_menu"."menu_id";
SELECT setval('"system_menu_menu_id_seq"', 38, true);
ALTER SEQUENCE "system_menu_menu_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_oper_log_oper_id_seq"
OWNED BY "system_oper_log"."oper_id";
SELECT setval('"system_oper_log_oper_id_seq"', 384, true);
ALTER SEQUENCE "system_oper_log_oper_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_role_role_id_seq"
OWNED BY "system_role"."role_id";
SELECT setval('"system_role_role_id_seq"', 6, true);
ALTER SEQUENCE "system_role_role_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_storage_storage_id_seq"
OWNED BY "system_storage"."storage_id";
SELECT setval('"system_storage_storage_id_seq"', 4, true);
ALTER SEQUENCE "system_storage_storage_id_seq" OWNER TO "postgres";

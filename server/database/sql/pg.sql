/*
PostgreSQL Backup
Database: elysia-admin/public
Backup Time: 2026-01-31 17:41:22
*/

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
DROP SEQUENCE IF EXISTS "public"."system_user_user_id_seq";
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
DROP TABLE IF EXISTS "public"."system_user";
DROP TABLE IF EXISTS "public"."system_user_role";
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
CREATE SEQUENCE "system_user_user_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
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
  "remark" varchar(255) COLLATE "pg_catalog"."default"
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
  "business_type" varchar(32) COLLATE "pg_catalog"."default",
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
  "remark" varchar(255) COLLATE "pg_catalog"."default"
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
LOCK TABLE "public"."system_api" IN SHARE MODE;
DELETE FROM "public"."system_api";
INSERT INTO "public"."system_api" ("api_id","api_name","api_path","api_method","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (197, '登录日志-查询列表', '/api/system/login-log/list', '1', 't', '2026-01-21 09:17:41.814552+00', NULL, NULL, NULL, 'f', NULL),(198, '登录日志-查询详情', '/api/system/login-log/:id', '1', 't', '2026-01-21 09:17:41.814552+00', NULL, NULL, NULL, 'f', NULL),(199, '登录日志-删除', '/api/system/login-log/:ids', '4', 't', '2026-01-21 09:17:41.814552+00', NULL, NULL, NULL, 'f', NULL),(148, '认证模块-web账号密码登录', '/api/auth/login', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(149, '认证模块-刷新令牌', '/api/auth/refresh', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(150, '认证模块-注册用户', '/api/auth/register', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(151, '认证模块-忘记密码', '/api/auth/forget', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(152, '认证模块-重置密码', '/api/auth/reset-password', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(153, '系统字典-查询所有-缓存数据', '/api/system/dict/data/all', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(154, '系统用户-创建', '/api/system/user', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(155, '系统用户-查询所有', '/api/system/user/all', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(156, '系统用户-查询列表', '/api/system/user/list', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(157, '系统用户-查询当前用户', '/api/system/user/info', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(158, '系统用户-查询详情', '/api/system/user/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(159, '系统用户-更新', '/api/system/user', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(160, '系统用户-删除', '/api/system/user/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(161, '系统字典-创建-类型', '/api/system/dict/type', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(162, '系统字典-查询所有-缓存类型', '/api/system/dict/type/all', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(163, '系统字典-查询列表-类型', '/api/system/dict/type/list', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(164, '系统字典-查询详情-类型', '/api/system/dict/type/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(165, '系统字典-更新-类型', '/api/system/dict/type', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(166, '系统字典-删除-类型', '/api/system/dict/type/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(167, '系统字典-创建-数据', '/api/system/dict/data', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(168, '系统字典-查询列表-数据', '/api/system/dict/data/list', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(169, '系统字典-查询详情-数据', '/api/system/dict/data/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(170, '系统字典-更新-数据', '/api/system/dict/data', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(171, '系统字典-删除-数据', '/api/system/dict/data/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(172, '系统菜单-创建菜单', '/api/system/menu', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(173, '系统菜单-查询用户菜单树', '/api/system/menu/simple', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(174, '系统菜单-查询完整菜单树', '/api/system/menu/tree', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(175, '系统菜单-查询菜单详情', '/api/system/menu/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(176, '系统菜单-更新菜单', '/api/system/menu', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(177, '系统菜单-删除菜单', '/api/system/menu/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(178, '系统菜单-创建按钮', '/api/system/menu/btn', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(179, '系统菜单-更新按钮', '/api/system/menu/btn', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(180, '系统菜单-删除按钮', '/api/system/menu/btn/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(181, '系统角色-创建', '/api/system/role', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(182, '系统角色-查询列表', '/api/system/role/list', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(183, '系统角色-查询角色权限', '/api/system/role/permission/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(184, '系统角色-查询详情', '/api/system/role/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(185, '系统角色-更新', '/api/system/role', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(186, '系统角色-更新角色权限', '/api/system/role/permission', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(187, '系统角色-删除', '/api/system/role/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(188, '系统部门-创建', '/api/system/dept', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(189, '系统部门-查询部门树', '/api/system/dept/tree', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(190, '系统部门-更新', '/api/system/dept', '3', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(191, '系统部门-删除', '/api/system/dept/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(192, '系统API-创建', '/api/system/api', '2', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(193, '系统API-查询列表', '/api/system/api/list', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(194, '系统API-查询详情', '/api/system/api/:id', '1', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(196, '系统API-删除', '/api/system/api/:ids', '4', 't', '2026-01-10 08:59:01.524419+00', NULL, NULL, NULL, 'f', NULL),(206, '系统IP黑名单-删除', '/api/system/ip-black/:ids', '4', 't', '2026-01-24 05:26:10.282+00', NULL, '2026-01-24 08:17:16.879+00', NULL, 'f', NULL),(195, '系统API-更新', '/api/system/api', '3', 't', '2026-01-10 08:59:01.524+00', NULL, '2026-01-23 07:44:58.028+00', NULL, 'f', NULL),(200, '操作日志-查询列表', '/api/system/oper-log/list', '1', 't', '2026-01-23 08:12:23.256932+00', NULL, NULL, NULL, 'f', NULL),(201, '操作日志-查询详情', '/api/system/oper-log/:id', '1', 't', '2026-01-23 08:12:23.256932+00', NULL, NULL, NULL, 'f', NULL),(202, '操作日志-删除', '/api/system/oper-log/:ids', '4', 't', '2026-01-23 08:12:23.256932+00', NULL, NULL, NULL, 'f', NULL),(203, '系统IP黑名单-创建', '/api/system/ip-black', '2', 't', '2026-01-24 05:26:10.282712+00', NULL, NULL, NULL, 'f', NULL),(204, '系统IP黑名单-查询全部', '/api/system/ip-black/all', '1', 't', '2026-01-24 05:26:10.282712+00', NULL, NULL, NULL, 'f', NULL),(207, '健康检查-系统健康检查', '/api/health', '1', 't', '2026-01-26 06:11:14.276327+00', NULL, NULL, NULL, 'f', NULL),(208, '健康检查-数据库健康检查', '/api/health/db', '1', 't', '2026-01-26 06:11:14.276327+00', NULL, NULL, NULL, 'f', NULL),(205, '系统IP黑名单-更新', '/api/system/ip-black', '3', 't', '2026-01-24 05:26:10.282+00', NULL, '2026-01-24 08:16:56.659+00', NULL, 'f', NULL),(209, '健康检查-Redis健康检查', '/api/health/redis', '1', 't', '2026-01-26 06:13:00.382006+00', NULL, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dept" IN SHARE MODE;
DELETE FROM "public"."system_dept";
INSERT INTO "public"."system_dept" ("dept_id","dept_name","status","parent_id","create_time","create_by","update_time","update_by","del_flag","remark","sort") VALUES (1, 'Elysia-Admin科技', 't', 0, '2025-12-31 05:30:19.896242+00', NULL, NULL, NULL, 'f', NULL, 0),(2, '长沙总公司', 't', 1, '2025-12-31 05:38:35.375031+00', NULL, NULL, NULL, 'f', NULL, 0),(3, '杭州分公司', 't', 1, '2025-12-31 05:38:44.9+00', NULL, '2025-12-31 09:23:34.735+00', NULL, 'f', '', 0),(4, '研发部门', 't', 2, '2025-12-31 09:27:56.164569+00', NULL, NULL, NULL, 'f', NULL, 0),(5, '市场部门', 't', 2, '2026-01-06 07:57:35.255585+00', NULL, NULL, NULL, 'f', NULL, 0),(6, '测试部门', 't', 2, '2026-01-06 07:58:01.206845+00', NULL, NULL, NULL, 'f', NULL, 0),(7, '财务部门', 't', 2, '2026-01-06 07:58:15.84004+00', NULL, NULL, NULL, 'f', NULL, 0),(8, '运维部门', 't', 2, '2026-01-06 07:58:24.001631+00', NULL, '2026-01-06 08:03:57.027+00', NULL, 'f', NULL, 0)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_data" IN SHARE MODE;
DELETE FROM "public"."system_dict_data";
INSERT INTO "public"."system_dict_data" ("dict_code","dict_sort","dict_value","dict_label","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark","tag_type","custom_class") VALUES (1, 0, '0', '未知', 'system_user_sex', 't', '2025-12-15 07:26:11.870532+00', NULL, NULL, NULL, 'f', NULL, NULL, NULL),(2, 1, '1', '男', 'system_user_sex', 't', '2025-12-15 07:26:20.125+00', NULL, '2025-12-22 07:06:06.339+00', NULL, 'f', NULL, NULL, NULL),(3, 2, '2', '女', 'system_user_sex', 't', '2025-12-15 07:26:26.649+00', NULL, '2025-12-22 07:06:10.191+00', NULL, 'f', NULL, NULL, NULL),(4, 0, '0', '系统通知', 'system_notice_type', 't', '2025-12-22 06:18:34.393991+00', NULL, '2025-12-22 07:42:26.789+00', NULL, 'f', NULL, NULL, NULL),(8, 0, '4', 'DELETE', 'api_request_method', 't', '2025-12-24 07:44:27.425+00', NULL, '2025-12-29 03:00:48.842+00', NULL, 'f', '', 'danger', ''),(7, 0, '3', 'PUT', 'api_request_method', 't', '2025-12-24 07:44:18.668+00', NULL, '2025-12-29 03:01:00.962+00', NULL, 'f', '', 'warning', ''),(5, 0, '1', 'POST', 'api_request_method', 't', '2025-12-24 07:43:57.346+00', NULL, '2025-12-29 03:01:08.528+00', NULL, 'f', '', 'success', ''),(6, 0, '2', 'GET', 'api_request_method', 't', '2025-12-24 07:44:11.389+00', NULL, '2025-12-29 03:01:13.623+00', NULL, 'f', '', 'info', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_dict_type" IN SHARE MODE;
DELETE FROM "public"."system_dict_type";
INSERT INTO "public"."system_dict_type" ("dict_id","dict_name","dict_type","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (1, '用户性别', 'system_user_sex', 't', '2025-12-15 07:22:45.589436+00', NULL, NULL, NULL, 'f', NULL),(2, '通知类型', 'system_notice_type', 't', '2025-12-22 06:12:58.98+00', NULL, '2025-12-22 07:04:21.064+00', NULL, 'f', NULL),(3, 'API请求方法', 'api_request_method', 't', '2025-12-24 07:40:36.046+00', NULL, '2026-01-07 03:19:12.302+00', NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_ip_black" IN SHARE MODE;
DELETE FROM "public"."system_ip_black";
INSERT INTO "public"."system_ip_black" ("ip_black_id","ip_address","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (6, '192.168.2.3', 't', '2026-01-24 07:45:47.878+00', NULL, '2026-01-24 08:38:01.061+00', NULL, 'f', '')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_login_log" IN SHARE MODE;
DELETE FROM "public"."system_login_log";
INSERT INTO "public"."system_login_log" ("log_id","login_type","client_type","client_platform","ipaddr","login_location","user_agent","os","message","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (30, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:01:24.27823+00', 1, NULL, NULL, 'f', NULL),(14, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10', '操作成功', 't', '2026-01-23 08:02:12.020063+00', 1, NULL, NULL, 'f', NULL),(15, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-24 07:35:21.427881+00', 1, NULL, NULL, 'f', NULL),(16, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-24 07:45:20.595852+00', 1, NULL, NULL, 'f', NULL),(17, 'admin', 'web', 'chrome', '192.168.2.3', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-24 07:49:13.330033+00', 1, NULL, NULL, 'f', NULL),(18, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 02:59:40.867494+00', 1, NULL, NULL, 'f', NULL),(19, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:00:18.04803+00', 1, NULL, NULL, 'f', NULL),(20, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:00:57.41626+00', 1, NULL, NULL, 'f', NULL),(21, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:01:19.697876+00', 1, NULL, NULL, 'f', NULL),(22, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:01:53.314121+00', 1, NULL, NULL, 'f', NULL),(23, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:02:54.9419+00', 1, NULL, NULL, 'f', NULL),(24, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:03:23.044173+00', 1, NULL, NULL, 'f', NULL),(25, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:03:59.133383+00', 1, NULL, NULL, 'f', NULL),(26, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 03:28:37.251769+00', 1, NULL, NULL, 'f', NULL),(27, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', 'Android 6.0', '操作成功', 't', '2026-01-26 05:33:27.376384+00', 1, NULL, NULL, 'f', NULL),(28, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', 'Android 6.0', '操作成功', 't', '2026-01-26 05:59:26.617842+00', 1, NULL, NULL, 'f', NULL),(29, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 06:45:02.048269+00', 1, NULL, NULL, 'f', NULL),(31, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:01:52.750747+00', 1, NULL, NULL, 'f', NULL),(32, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:02:08.258542+00', 1, NULL, NULL, 'f', NULL),(33, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:02:44.389464+00', 1, NULL, NULL, 'f', NULL),(34, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:05:55.866661+00', 1, NULL, NULL, 'f', NULL),(35, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:14:51.684987+00', 1, NULL, NULL, 'f', NULL),(36, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:19:04.960411+00', 1, NULL, NULL, 'f', NULL),(37, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 07:45:51.320313+00', 1, NULL, NULL, 'f', NULL),(38, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-26 08:08:59.59318+00', 1, NULL, NULL, 'f', NULL),(39, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:03:46.22367+00', 1, NULL, NULL, 'f', NULL),(40, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:16:52.056126+00', 1, NULL, NULL, 'f', NULL),(41, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:32:27.635405+00', 1, NULL, NULL, 'f', NULL),(42, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:33:42.652617+00', 1, NULL, NULL, 'f', NULL),(43, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:34:29.986486+00', 1, NULL, NULL, 'f', NULL),(44, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:43:27.668959+00', 1, NULL, NULL, 'f', NULL),(45, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 07:45:30.102289+00', 1, NULL, NULL, 'f', NULL),(46, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:03:06.838241+00', 1, NULL, NULL, 'f', NULL),(47, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:03:47.756179+00', 1, NULL, NULL, 'f', NULL),(48, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:19:50.535412+00', 1, NULL, NULL, 'f', NULL),(49, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:32:47.096896+00', 1, NULL, NULL, 'f', NULL),(50, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:33:17.854035+00', 1, NULL, NULL, 'f', NULL),(51, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:34:13.601558+00', 1, NULL, NULL, 'f', NULL),(52, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 08:44:02.504052+00', 1, NULL, NULL, 'f', NULL),(53, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 09:03:31.926837+00', 1, NULL, NULL, 'f', NULL),(54, 'admin', 'web', 'chrome', '192.168.2.22', '内网地址', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'Windows 10/11', '操作成功', 't', '2026-01-31 09:32:41.354724+00', 1, NULL, NULL, 'f', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu" IN SHARE MODE;
DELETE FROM "public"."system_menu";
INSERT INTO "public"."system_menu" ("menu_id","path","name","component","title","icon","show_badge","show_text_badge","is_hide","is_hide_tab","link","is_iframe","keep_alive","fixed_tab","create_time","create_by","update_time","update_by","del_flag","remark","active_path","sort","parent_id","status","is_full_page") VALUES (1, '/dashboard', 'Dashboard', '/index/index', 'menus.dashboard.title', 'ri:pie-chart-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:44:03.266366+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(2, 'console', 'Console', '/dashboard/console', 'menus.dashboard.console', 'ri:home-smile-2-line', 'f', NULL, 'f', 'f', NULL, 'f', 'f', 't', '2026-01-07 06:53:09.690864+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 1, 't', 'f'),(3, '/system', 'System', '/index/index', 'menus.system.title', 'ri:user-3-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:57:44.645285+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(4, 'user', 'User', '/system/user', 'menus.system.user', 'ri:user-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:03:52.388903+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(5, 'role', 'Role', '/system/role', 'menus.system.role', 'ri:user-settings-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:05:15.131251+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(6, 'user-center', 'UserCenter', '/system/user-center', 'menus.system.userCenter', 'ri:user-line', 'f', NULL, 't', 't', NULL, 'f', 't', 'f', '2026-01-07 07:20:40.477837+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(7, 'menu', 'Menus', '/system/menu', 'menus.system.menu', 'ri:menu-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:21:53.540874+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(8, 'dept', 'Dept', '/system/dept', 'menus.system.dept', 'material-symbols:groups-2-outline', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:10.052595+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(9, 'dict', 'Dict', '/system/dict', 'menus.system.dict', 'material-symbols:book-2-outline', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:25.225276+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(10, 'api', 'Api', '/system/api', 'menus.system.api', 'tabler:api', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:39.036648+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3, 't', 'f'),(11, '/result', 'Result', '/index/index', 'menus.result.title', 'ri:checkbox-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:26:35.237982+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(12, 'success', 'ResultSuccess', '/result/success', 'menus.result.success', 'ri:checkbox-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:27:31.460994+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 11, 't', 'f'),(13, 'fail', 'ResultFail', '/result/fail', 'menus.result.fail', 'ri:close-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:27:49.779678+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 11, 't', 'f'),(14, '/exception', 'Exception', '/index/index', 'menus.exception.title', 'ri:error-warning-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:28:42.719667+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL, 't', 'f'),(15, '403', '403', '/exception/403', 'menus.exception.forbidden', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:29:38.63238+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14, 't', 'f'),(16, '404', '404', '/exception/404', 'menus.exception.notFound', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:29:58.311776+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14, 't', 'f'),(17, '500', '500', '/exception/500', 'menus.exception.serverError', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:30:14.928053+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14, 't', 'f'),(18, 'blacklist', 'Blacklist', '/system/blacklist', 'menus.system.blacklist', 'material-symbols:block-outline', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-24 05:35:39.52242+00', NULL, '2026-01-31 08:38:20.111+00', NULL, 'f', NULL, '', 0, 3, 't', 'f'),(19, 'log', 'Log', '', 'menus.system.log', 'ri:file-list-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:39:40.82449+00', NULL, NULL, NULL, 'f', NULL, '', 0, 3, 't', 'f'),(20, 'loginLog', 'LoginLog', '/system/log/loginlog', 'menus.system.loginLog', 'ri:login-circle-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:40:46.820945+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f'),(21, 'operLog', 'OperLog', '/system/log/operlog', 'menus.system.operLog', 'ri:settings-3-line', 'f', '', 'f', 'f', '', 'f', 't', 'f', '2026-01-31 08:41:30.611732+00', NULL, NULL, NULL, 'f', NULL, '', 0, 19, 't', 'f')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu_btn" IN SHARE MODE;
DELETE FROM "public"."system_menu_btn";
INSERT INTO "public"."system_menu_btn" ("menu_id","sort","title","permission","create_time","create_by","update_time","update_by","del_flag","remark","btn_id","status") VALUES (7, 0, '编辑', 'system:menu:update', '2026-01-10 06:00:05.075948+00', NULL, NULL, NULL, 'f', NULL, 2, 't'),(7, 0, '删除', 'system:menu:delete', '2026-01-10 06:00:44.132664+00', NULL, NULL, NULL, 'f', NULL, 3, 't'),(7, 0, '查询', 'system:menu:query', '2026-01-10 06:02:04.390263+00', NULL, NULL, NULL, 'f', NULL, 5, 't'),(7, 1, '新增', 'system:menu:create', '2026-01-10 05:59:43.793701+00', NULL, '2026-01-10 08:23:43.01+00', NULL, 'f', NULL, 1, 't'),(8, 0, '新增', 'system:dept:create', '2026-01-10 08:37:59.572615+00', NULL, NULL, NULL, 'f', NULL, 9, 't'),(8, 0, '删除', 'system:dept:delete', '2026-01-10 08:38:57.597483+00', NULL, NULL, NULL, 'f', NULL, 10, 't'),(8, 0, '更新', 'system:dept:update', '2026-01-10 08:39:12.67185+00', NULL, NULL, NULL, 'f', NULL, 11, 't'),(8, 0, '查询', 'system:dept:query', '2026-01-10 08:39:27.121017+00', NULL, NULL, NULL, 'f', NULL, 12, 't'),(10, 0, '查询', 'system:api:query', '2026-01-10 08:40:18.466495+00', NULL, NULL, NULL, 'f', NULL, 14, 't'),(10, 0, '更新', 'system:api:update', '2026-01-10 08:40:34.207498+00', NULL, NULL, NULL, 'f', NULL, 15, 't'),(10, 0, '删除', 'system:api:delete', '2026-01-10 08:40:45.232152+00', NULL, NULL, NULL, 'f', NULL, 16, 't'),(9, 0, '新增类型', 'system:dict:type:create', '2026-01-10 08:41:15.252098+00', NULL, NULL, NULL, 'f', NULL, 17, 't'),(9, 0, '新增数据', 'system:dict:data:create', '2026-01-10 08:41:36.205116+00', NULL, NULL, NULL, 'f', NULL, 18, 't'),(9, 0, '查询类型', 'system:dict:type:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 19, 't'),(9, 0, '查询数据', 'system:dict:data:query', '2026-01-10 08:41:53.691176+00', NULL, '2026-01-10 08:42:42.47+00', NULL, 'f', NULL, 20, 't'),(9, 0, '更新类型', 'system:dict:type:update', '2026-01-10 08:45:27.870497+00', NULL, NULL, NULL, 'f', NULL, 21, 't'),(9, 0, '更新数据', 'system:dict:data:update', '2026-01-10 08:45:45.848287+00', NULL, NULL, NULL, 'f', NULL, 22, 't'),(9, 0, '删除类型', 'system:dict:type:delete', '2026-01-10 08:46:09.840199+00', NULL, NULL, NULL, 'f', NULL, 23, 't'),(9, 0, '删除数据', 'system:dict:data:delete', '2026-01-10 08:46:22.050204+00', NULL, NULL, NULL, 'f', NULL, 24, 't'),(10, 0, '新增', 'system:api:create', '2026-01-10 08:40:02.457593+00', NULL, '2026-01-10 08:47:05.708+00', NULL, 'f', NULL, 13, 't'),(4, 0, '新增', 'system:user:create', '2026-01-31 08:25:15.877116+00', NULL, NULL, NULL, 'f', NULL, 25, 't'),(4, 0, '查询', 'system:user:query', '2026-01-31 08:25:34.533779+00', NULL, NULL, NULL, 'f', NULL, 26, 't'),(4, 0, '编辑', 'system:user:update', '2026-01-31 08:25:46.97912+00', NULL, NULL, NULL, 'f', NULL, 27, 't'),(4, 0, '删除', 'system:user:delete', '2026-01-31 08:25:59.978634+00', NULL, NULL, NULL, 'f', NULL, 28, 't'),(5, 0, '新增', 'system:role:create', '2026-01-31 08:26:58.242896+00', NULL, NULL, NULL, 'f', NULL, 29, 't'),(5, 0, '查询', 'system:role:query', '2026-01-31 08:27:15.553667+00', NULL, NULL, NULL, 'f', NULL, 30, 't'),(5, 0, '编辑', 'system:role:update', '2026-01-31 08:27:28.725263+00', NULL, NULL, NULL, 'f', NULL, 31, 't'),(5, 0, '删除', 'system:role:delete', '2026-01-31 08:27:47.884927+00', NULL, NULL, NULL, 'f', NULL, 32, 't'),(18, 0, '新增', 'system:ip-black:create', '2026-01-31 08:31:53.257359+00', NULL, NULL, NULL, 'f', NULL, 33, 't'),(18, 0, '查询', 'system:ip-black:query', '2026-01-31 08:32:10.402536+00', NULL, NULL, NULL, 'f', NULL, 34, 't'),(18, 0, '编辑', 'system:ip-black:update', '2026-01-31 08:32:24.058834+00', NULL, NULL, NULL, 'f', NULL, 35, 't'),(18, 0, '删除', 'system:ip-black:delete', '2026-01-31 08:32:37.241391+00', NULL, NULL, NULL, 'f', NULL, 36, 't'),(20, 0, '查询', 'system:login-log:query', '2026-01-31 08:42:39.4695+00', NULL, NULL, NULL, 'f', NULL, 37, 't'),(20, 0, '删除', 'system:login-log:delete', '2026-01-31 08:42:56.434237+00', NULL, NULL, NULL, 'f', NULL, 38, 't'),(21, 0, '查询', 'system:oper-log:query', '2026-01-31 08:43:23.224565+00', NULL, NULL, NULL, 'f', NULL, 39, 't'),(21, 0, '删除', 'system:oper-log:delete', '2026-01-31 08:43:40.619376+00', NULL, NULL, NULL, 'f', NULL, 40, 't')
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
INSERT INTO "public"."system_role_menu" ("role_id","menu_id","menu_btn_id") VALUES (2, 1, NULL),(2, 2, NULL),(1, 1, NULL),(1, 2, NULL),(1, 3, NULL),(1, 4, NULL),(1, 4, 25),(1, 4, 26),(1, 4, 27),(1, 4, 28),(1, 5, NULL),(1, 5, 29),(1, 5, 30),(1, 5, 31),(1, 5, 32),(1, 6, NULL),(1, 7, NULL),(1, 7, 2),(1, 7, 3),(1, 7, 5),(1, 7, 1),(1, 8, NULL),(1, 8, 9),(1, 8, 10),(1, 8, 11),(1, 8, 12),(1, 9, NULL),(1, 9, 17),(1, 9, 18),(1, 9, 19),(1, 9, 20),(1, 9, 21),(1, 9, 22),(1, 9, 23),(1, 9, 24),(1, 10, NULL),(1, 10, 14),(1, 10, 15),(1, 10, 16),(1, 10, 13),(1, 18, NULL),(1, 18, 33),(1, 18, 34),(1, 18, 35),(1, 18, 36),(1, 19, NULL),(1, 20, NULL),(1, 20, 37),(1, 20, 38),(1, 21, NULL),(1, 21, 39),(1, 21, 40),(1, 11, NULL),(1, 12, NULL),(1, 13, NULL),(1, 14, NULL),(1, 15, NULL),(1, 16, NULL),(1, 17, NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user" IN SHARE MODE;
DELETE FROM "public"."system_user";
INSERT INTO "public"."system_user" ("user_id","username","password","nickname","email","phone","sex","avatar","create_time","create_by","update_time","update_by","del_flag","remark","status","dept_id") VALUES (13, 'xiaomei', '$2b$10$ZVclyurmYrDZqiZE.L2/H.PCKgTENOM9u0Hh2zNv/QjvtnMrNgxhy', '罗德风', '2652365944@qq.com', NULL, '0', NULL, '2025-12-16 02:36:49.177028+00', NULL, NULL, NULL, 'f', NULL, 't', NULL),(1, 'admin', '$2b$10$4KgfwszKOF5Tuc9gcUr1nOgTTDqSfnbH00fQvNINvJ.U4FGvyWska', '梅', '1360658549@qq.com', '19899999999', '0', NULL, '2025-12-12 08:41:41.8583+00', NULL, '2025-12-16 07:12:30.583+00', 1765869150583, 'f', NULL, 't', NULL)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user_role" IN SHARE MODE;
DELETE FROM "public"."system_user_role";
INSERT INTO "public"."system_user_role" ("role_id","user_id") VALUES (1, 1),(2, 1),(3, 1)
;
COMMIT;
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
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_pkey" PRIMARY KEY ("user_id");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_name_unique" UNIQUE ("dict_name");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_type_unique" UNIQUE ("dict_type");
ALTER TABLE "system_menu_btn" ADD CONSTRAINT "system_menu_btn_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_menu_btn_id_system_menu_btn_btn_id_fk" FOREIGN KEY ("menu_btn_id") REFERENCES "public"."system_menu_btn" ("btn_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_role_id_system_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."system_role" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_username_unique" UNIQUE ("username");
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_dept_id_system_dept_dept_id_fk" FOREIGN KEY ("dept_id") REFERENCES "public"."system_dept" ("dept_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user_role" ADD CONSTRAINT "system_user_role_role_id_system_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."system_role" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user_role" ADD CONSTRAINT "system_user_role_user_id_system_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."system_user" ("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER SEQUENCE "system_api_api_id_seq"
OWNED BY "system_api"."api_id";
SELECT setval('"system_api_api_id_seq"', 209, true);
ALTER SEQUENCE "system_api_api_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dept_dept_id_seq"
OWNED BY "system_dept"."dept_id";
SELECT setval('"system_dept_dept_id_seq"', 8, true);
ALTER SEQUENCE "system_dept_dept_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dict_data_dict_code_seq"
OWNED BY "system_dict_data"."dict_code";
SELECT setval('"system_dict_data_dict_code_seq"', 8, true);
ALTER SEQUENCE "system_dict_data_dict_code_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_dict_type_dict_id_seq"
OWNED BY "system_dict_type"."dict_id";
SELECT setval('"system_dict_type_dict_id_seq"', 3, true);
ALTER SEQUENCE "system_dict_type_dict_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_ip_black_ip_black_id_seq"
OWNED BY "system_ip_black"."ip_black_id";
SELECT setval('"system_ip_black_ip_black_id_seq"', 6, true);
ALTER SEQUENCE "system_ip_black_ip_black_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_login_log_log_id_seq"
OWNED BY "system_login_log"."log_id";
SELECT setval('"system_login_log_log_id_seq"', 54, true);
ALTER SEQUENCE "system_login_log_log_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_btn_btn_id_seq"
OWNED BY "system_menu_btn"."btn_id";
SELECT setval('"system_menu_btn_btn_id_seq"', 40, true);
ALTER SEQUENCE "system_menu_btn_btn_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_menu_menu_id_seq"
OWNED BY "system_menu"."menu_id";
SELECT setval('"system_menu_menu_id_seq"', 21, true);
ALTER SEQUENCE "system_menu_menu_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_oper_log_oper_id_seq"
OWNED BY "system_oper_log"."oper_id";
SELECT setval('"system_oper_log_oper_id_seq"', 1, false);
ALTER SEQUENCE "system_oper_log_oper_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_role_role_id_seq"
OWNED BY "system_role"."role_id";
SELECT setval('"system_role_role_id_seq"', 1, true);
ALTER SEQUENCE "system_role_role_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_user_user_id_seq"
OWNED BY "system_user"."user_id";
SELECT setval('"system_user_user_id_seq"', 13, true);
ALTER SEQUENCE "system_user_user_id_seq" OWNER TO "postgres";

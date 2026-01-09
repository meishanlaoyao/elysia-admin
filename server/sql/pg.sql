/*
PostgreSQL Backup
Database: elysia-admin/public
Backup Time: 2026-01-07 16:11:57
*/

DROP SEQUENCE IF EXISTS "public"."system_api_api_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_dept_dept_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_dict_data_dict_code_seq";
DROP SEQUENCE IF EXISTS "public"."system_dict_type_dict_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_menu_menu_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_role_role_id_seq";
DROP SEQUENCE IF EXISTS "public"."system_user_user_id_seq";
DROP TABLE IF EXISTS "public"."system_api";
DROP TABLE IF EXISTS "public"."system_dept";
DROP TABLE IF EXISTS "public"."system_dict_data";
DROP TABLE IF EXISTS "public"."system_dict_type";
DROP TABLE IF EXISTS "public"."system_menu";
DROP TABLE IF EXISTS "public"."system_menu_api";
DROP TABLE IF EXISTS "public"."system_role";
DROP TABLE IF EXISTS "public"."system_role_menu";
DROP TABLE IF EXISTS "public"."system_user";
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
CREATE SEQUENCE "system_menu_menu_id_seq" 
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
  "parent_id" int8
)
;
ALTER TABLE "system_menu" OWNER TO "postgres";
CREATE TABLE "system_menu_api" (
  "menu_id" int8,
  "api_id" int8,
  "title" varchar(64) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "system_menu_api" OWNER TO "postgres";
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
  "menu_id" int8
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
  "status" bool DEFAULT true
)
;
ALTER TABLE "system_user" OWNER TO "postgres";
BEGIN;
LOCK TABLE "public"."system_api" IN SHARE MODE;
DELETE FROM "public"."system_api";
INSERT INTO "public"."system_api" ("api_id","api_name","api_path","api_method","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (3, '刷新令牌', '/api/auth/refresh', '1', 't', '2025-12-24 08:19:57.599423+00', NULL, NULL, NULL, 'f', NULL),(4, '账号密码登录', '/api/auth/login', '1', 't', '2025-12-24 08:20:21.280827+00', NULL, NULL, NULL, 'f', NULL),(6, '忘记密码', '/api/auth/forget', '1', 't', '2025-12-24 09:30:19.252835+00', NULL, NULL, NULL, 'f', NULL),(7, '重置密码', '/api/auth/reset-password', '1', 't', '2025-12-24 09:33:43.758475+00', NULL, NULL, NULL, 'f', NULL),(11, '系统用户-更新', '/api/system/user', '3', 't', '2025-12-30 06:01:25.340176+00', NULL, NULL, NULL, 'f', NULL),(12, '系统用户-查询所有', '/api/system/user/all', '2', 't', '2025-12-30 06:15:19.172195+00', NULL, NULL, NULL, 'f', NULL),(14, '系统用户-查询当前用户​', '/api/system/user/info', '2', 't', '2025-12-30 06:16:56.298094+00', NULL, NULL, NULL, 'f', NULL),(15, '系统用户-查询详情', '/system/user/:id', '2', 't', '2025-12-30 06:17:57.956605+00', NULL, NULL, NULL, 'f', NULL),(8, '系统用户-创建', '/api/system/user', '1', 't', '2025-12-30 05:59:01.083+00', NULL, '2025-12-31 02:00:23.423+00', NULL, 'f', NULL),(13, '系统用户-查询列表', '/api/system/user/list', '2', 't', '2025-12-30 06:15:51.584+00', NULL, '2025-12-31 02:00:24.711+00', NULL, 'f', NULL),(5, '注册用户', '/api/auth/register', '1', 't', '2025-12-24 09:28:48.107+00', NULL, '2025-12-31 02:00:30.171+00', NULL, 'f', ''),(16, '系统用户-删除', '/system/user/:ids', '4', 't', '2025-12-30 06:18:24.506+00', NULL, '2026-01-06 07:06:08.175+00', NULL, 'f', NULL)
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
LOCK TABLE "public"."system_menu" IN SHARE MODE;
DELETE FROM "public"."system_menu";
INSERT INTO "public"."system_menu" ("menu_id","path","name","component","title","icon","show_badge","show_text_badge","is_hide","is_hide_tab","link","is_iframe","keep_alive","fixed_tab","create_time","create_by","update_time","update_by","del_flag","remark","active_path","sort","parent_id") VALUES (1, '/dashboard', 'Dashboard', '/index/index', 'menus.dashboard.title', 'ri:pie-chart-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:44:03.266366+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL),(2, 'console', 'Console', '/dashboard/console', 'menus.dashboard.console', 'ri:home-smile-2-line', 'f', NULL, 'f', 'f', NULL, 'f', 'f', 't', '2026-01-07 06:53:09.690864+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 1),(3, '/system', 'System', '/index/index', 'menus.system.title', 'ri:user-3-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 06:57:44.645285+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL),(4, 'user', 'User', '/system/user', 'menus.system.user', 'ri:user-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:03:52.388903+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(5, 'role', 'Role', '/system/role', 'menus.system.role', 'ri:user-settings-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:05:15.131251+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(6, 'user-center', 'UserCenter', '/system/user-center', 'menus.system.userCenter', 'ri:user-line', 'f', NULL, 't', 't', NULL, 'f', 't', 'f', '2026-01-07 07:20:40.477837+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(7, 'menu', 'Menus', '/system/menu', 'menus.system.menu', 'ri:menu-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:21:53.540874+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(8, 'dept', 'Dept', '/system/dept', 'menus.system.dept', 'material-symbols:groups-2-outline', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:10.052595+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(9, 'dict', 'Dict', '/system/dict', 'menus.system.dict', 'material-symbols:book-2-outline', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:25.225276+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(10, 'api', 'Api', '/system/api', 'menus.system.api', 'tabler:api', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:22:39.036648+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 3),(11, '/result', 'Result', '/index/index', 'menus.result.title', 'ri:checkbox-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:26:35.237982+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL),(12, 'success', 'ResultSuccess', '/result/success', 'menus.result.success', 'ri:checkbox-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:27:31.460994+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 11),(13, 'fail', 'ResultFail', '/result/fail', 'menus.result.fail', 'ri:close-circle-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:27:49.779678+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 11),(14, '/exception', 'Exception', '/index/index', 'menus.exception.title', 'ri:error-warning-line', 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:28:42.719667+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, NULL),(15, '403', '403', '/exception/403', 'menus.exception.forbidden', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:29:38.63238+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14),(16, '404', '404', '/exception/404', 'menus.exception.notFound', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:29:58.311776+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14),(17, '500', '500', '/exception/500', 'menus.exception.serverError', NULL, 'f', NULL, 'f', 'f', NULL, 'f', 't', 'f', '2026-01-07 07:30:14.928053+00', NULL, NULL, NULL, 'f', NULL, NULL, 0, 14)
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_menu_api" IN SHARE MODE;
DELETE FROM "public"."system_menu_api";
COMMIT;
BEGIN;
LOCK TABLE "public"."system_role" IN SHARE MODE;
DELETE FROM "public"."system_role";
INSERT INTO "public"."system_role" ("role_id","role_name","role_code","sort","status","create_time","create_by","update_time","update_by","del_flag","remark") VALUES (1, '超级管理员', 'R_DATA', 0, 't', '2026-01-06 09:26:09.913+00', NULL, '2026-01-07 03:14:44.639+00', NULL, 'f', '拥有所有权限')
;
COMMIT;
BEGIN;
LOCK TABLE "public"."system_role_menu" IN SHARE MODE;
DELETE FROM "public"."system_role_menu";
COMMIT;
BEGIN;
LOCK TABLE "public"."system_user" IN SHARE MODE;
DELETE FROM "public"."system_user";
INSERT INTO "public"."system_user" ("user_id","username","password","nickname","email","phone","sex","avatar","create_time","create_by","update_time","update_by","del_flag","remark","status") VALUES (13, 'xiaomei', '$2b$10$ZVclyurmYrDZqiZE.L2/H.PCKgTENOM9u0Hh2zNv/QjvtnMrNgxhy', '罗德风', '2652365944@qq.com', NULL, '0', NULL, '2025-12-16 02:36:49.177028+00', NULL, NULL, NULL, 'f', NULL, 't'),(1, 'admin', '$2b$10$4KgfwszKOF5Tuc9gcUr1nOgTTDqSfnbH00fQvNINvJ.U4FGvyWska', '梅', '1360658549@qq.com', '19899999999', '0', NULL, '2025-12-12 08:41:41.8583+00', NULL, '2025-12-16 07:12:30.583+00', 1765869150583, 'f', NULL, 't')
;
COMMIT;
ALTER TABLE "system_api" ADD CONSTRAINT "system_api_pkey" PRIMARY KEY ("api_id");
ALTER TABLE "system_dept" ADD CONSTRAINT "system_dept_pkey" PRIMARY KEY ("dept_id");
ALTER TABLE "system_dict_data" ADD CONSTRAINT "system_dict_data_pkey" PRIMARY KEY ("dict_code");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_pkey" PRIMARY KEY ("dict_id");
ALTER TABLE "system_menu" ADD CONSTRAINT "system_menu_pkey" PRIMARY KEY ("menu_id");
ALTER TABLE "system_role" ADD CONSTRAINT "system_role_pkey" PRIMARY KEY ("role_id");
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_pkey" PRIMARY KEY ("user_id");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_name_unique" UNIQUE ("dict_name");
ALTER TABLE "system_dict_type" ADD CONSTRAINT "system_dict_type_dict_type_unique" UNIQUE ("dict_type");
ALTER TABLE "system_menu_api" ADD CONSTRAINT "system_menu_api_api_id_system_api_api_id_fk" FOREIGN KEY ("api_id") REFERENCES "public"."system_api" ("api_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_menu_api" ADD CONSTRAINT "system_menu_api_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_menu_id_system_menu_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."system_menu" ("menu_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_role_menu" ADD CONSTRAINT "system_role_menu_role_id_system_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."system_role" ("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "system_user" ADD CONSTRAINT "system_user_username_unique" UNIQUE ("username");
ALTER SEQUENCE "system_api_api_id_seq"
OWNED BY "system_api"."api_id";
SELECT setval('"system_api_api_id_seq"', 16, true);
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
ALTER SEQUENCE "system_menu_menu_id_seq"
OWNED BY "system_menu"."menu_id";
SELECT setval('"system_menu_menu_id_seq"', 17, true);
ALTER SEQUENCE "system_menu_menu_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_role_role_id_seq"
OWNED BY "system_role"."role_id";
SELECT setval('"system_role_role_id_seq"', 1, true);
ALTER SEQUENCE "system_role_role_id_seq" OWNER TO "postgres";
ALTER SEQUENCE "system_user_user_id_seq"
OWNED BY "system_user"."user_id";
SELECT setval('"system_user_user_id_seq"', 13, true);
ALTER SEQUENCE "system_user_user_id_seq" OWNER TO "postgres";

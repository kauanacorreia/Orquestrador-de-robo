# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_06_005829) do
  create_schema "extensions"

  # These are extensions that must be enabled in order to support this database
  enable_extension "extensions.pg_stat_statements"
  enable_extension "extensions.pgcrypto"
  enable_extension "extensions.uuid-ossp"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "vault.supabase_vault"

  create_table "public.companies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "cnpj", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.text "name", null: false
    t.text "notification_email"
    t.text "state_registration"
    t.text "status", default: "ACTIVE", null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.check_constraint "status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])", name: "companies_status_check"
    t.unique_constraint ["cnpj"], name: "companies_cnpj_key"
  end

  create_table "public.company_robot_configs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.jsonb "parameters", default: {}, null: false
    t.uuid "robot_id", null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["company_id"], name: "idx_company_robot_configs_company"
    t.index ["robot_id"], name: "idx_company_robot_configs_robot"
    t.unique_constraint ["company_id", "robot_id"], name: "company_robot_configs_company_id_robot_id_key"
  end

  create_table "public.execution_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.uuid "execution_id", null: false
    t.text "level", default: "INFO", null: false
    t.text "message", null: false
    t.index ["created_at"], name: "idx_execution_logs_created_at"
    t.index ["execution_id"], name: "idx_execution_logs_execution"
    t.check_constraint "level = ANY (ARRAY['INFO'::text, 'WARNING'::text, 'ERROR'::text, 'DEBUG'::text])", name: "execution_logs_level_check"
  end

  create_table "public.executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.text "error_message"
    t.timestamptz "finished_at"
    t.timestamptz "locked_at"
    t.uuid "robot_id", null: false
    t.uuid "schedule_id"
    t.timestamptz "started_at"
    t.text "status", default: "PENDING", null: false
    t.index ["company_id"], name: "idx_executions_company"
    t.index ["created_at"], name: "idx_executions_created_at"
    t.index ["robot_id"], name: "idx_executions_robot"
    t.index ["status"], name: "idx_executions_status"
    t.check_constraint "status = ANY (ARRAY['PENDING'::text, 'RUNNING'::text, 'SUCCESS'::text, 'FAILED'::text])", name: "executions_status_check"
  end

  create_table "public.profiles", id: :uuid, default: nil, force: :cascade do |t|
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "last_login"
    t.text "name", null: false
    t.text "role", default: "VIEWER", null: false
    t.check_constraint "role = ANY (ARRAY['ADMIN'::text, 'MANAGER'::text, 'VIEWER'::text])", name: "profiles_role_check"
  end

  create_table "public.robot_edit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "field_name", null: false
    t.text "new_value"
    t.text "old_value"
    t.uuid "robot_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["robot_id"], name: "index_robot_edit_logs_on_robot_id"
  end

  create_table "public.robot_versions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.uuid "robot_id", null: false
    t.jsonb "schema", null: false
    t.integer "version", null: false
    t.index ["robot_id", "version"], name: "idx_robot_versions_robot_version", unique: true
  end

  create_table "public.robots", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.integer "current_version", default: 1, null: false
    t.text "department"
    t.text "description"
    t.text "name", null: false
    t.jsonb "schema", default: {"fields" => []}, null: false
    t.text "status", default: "ACTIVE", null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.check_constraint "status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])", name: "robots_status_check"
  end

  create_table "public.schedules", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "company_id", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.text "cron_expression", null: false
    t.timestamptz "next_execution"
    t.uuid "robot_id", null: false
    t.text "status", default: "ACTIVE", null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["company_id"], name: "idx_schedules_company"
    t.index ["robot_id"], name: "idx_schedules_robot"
    t.check_constraint "status = ANY (ARRAY['ACTIVE'::text, 'PAUSED'::text])", name: "schedules_status_check"
  end

  add_foreign_key "public.company_robot_configs", "public.companies", name: "company_robot_configs_company_id_fkey", on_delete: :cascade
  add_foreign_key "public.company_robot_configs", "public.robots", name: "company_robot_configs_robot_id_fkey", on_delete: :cascade
  add_foreign_key "public.execution_logs", "public.executions", name: "execution_logs_execution_id_fkey", on_delete: :cascade
  add_foreign_key "public.executions", "public.companies", name: "executions_company_id_fkey", on_delete: :cascade
  add_foreign_key "public.executions", "public.robots", name: "executions_robot_id_fkey", on_delete: :cascade
  add_foreign_key "public.executions", "public.schedules", name: "executions_schedule_id_fkey", on_delete: :nullify
  add_foreign_key "public.profiles", "auth.users", column: "id", name: "profiles_id_fkey", on_delete: :cascade
  add_foreign_key "public.robot_edit_logs", "public.robots"
  add_foreign_key "public.robot_versions", "public.robots", name: "robot_versions_robot_id_fkey", on_delete: :cascade
  add_foreign_key "public.schedules", "public.companies", name: "schedules_company_id_fkey", on_delete: :cascade
  add_foreign_key "public.schedules", "public.robots", name: "schedules_robot_id_fkey", on_delete: :cascade

end

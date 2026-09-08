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

ActiveRecord::Schema[8.1].define(version: 2026_09_06_034000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "companies", id: :string, force: :cascade do |t|
    t.text "access_password"
    t.text "account_number"
    t.string "cnpj", null: false
    t.text "code"
    t.text "company_folder"
    t.datetime "created_at", null: false
    t.string "email"
    t.text "monetary_variation"
    t.string "name", null: false
    t.string "phone"
    t.text "pis_pasep"
    t.text "secret_phrase"
    t.boolean "simple_national_opt_in", default: false, null: false
    t.string "status", default: "active", null: false
    t.text "tax_regime"
    t.string "trade_name"
    t.datetime "updated_at", null: false
    t.index ["cnpj"], name: "index_companies_on_cnpj", unique: true
    t.index ["code"], name: "index_companies_on_code", unique: true
  end

  create_table "executions", id: :string, force: :cascade do |t|
    t.string "company_id", null: false
    t.datetime "created_at", null: false
    t.integer "duration_ms"
    t.datetime "finished_at"
    t.string "robot_name", null: false
    t.string "schedule_id"
    t.datetime "started_at", null: false
    t.string "status", default: "running", null: false
    t.string "triggered_by", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_executions_on_company_id"
    t.index ["schedule_id"], name: "index_executions_on_schedule_id"
    t.index ["started_at"], name: "index_executions_on_started_at"
    t.index ["status"], name: "index_executions_on_status"
    t.index ["triggered_by"], name: "index_executions_on_triggered_by"
  end

  create_table "log_entries", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "execution_id", null: false
    t.string "level", null: false
    t.text "message", null: false
    t.datetime "timestamp", null: false
    t.datetime "updated_at", null: false
    t.index ["execution_id", "timestamp"], name: "index_log_entries_on_execution_id_and_timestamp"
    t.index ["execution_id"], name: "index_log_entries_on_execution_id"
  end

  create_table "profiles", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "email"
    t.datetime "last_login"
    t.datetime "last_login_at"
    t.string "name"
    t.string "role", default: "OPERATOR"
    t.text "status", default: "ACTIVE", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_profiles_on_email", unique: true
    t.index ["status"], name: "index_profiles_on_status"
    t.check_constraint "role::text = ANY (ARRAY['ADMIN'::character varying, 'OPERATOR'::character varying]::text[])", name: "profiles_role_check"
    t.check_constraint "status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])", name: "profiles_status_check"
  end

  create_table "robot_edit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "field_name", null: false
    t.text "new_value"
    t.text "old_value"
    t.bigint "robot_id", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["robot_id"], name: "index_robot_edit_logs_on_robot_id"
  end

  create_table "robot_versions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "robot_id", null: false
    t.json "schema"
    t.datetime "updated_at", null: false
    t.integer "version", null: false
    t.index ["robot_id", "version"], name: "index_robot_versions_on_robot_id_and_version", unique: true
    t.index ["robot_id"], name: "index_robot_versions_on_robot_id"
  end

  create_table "robots", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "current_version", default: 1, null: false
    t.text "department"
    t.text "description"
    t.string "name", null: false
    t.json "schema"
    t.string "status", default: "ACTIVE", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_robots_on_status"
  end

  create_table "schedules", id: :string, force: :cascade do |t|
    t.string "company_id", null: false
    t.datetime "created_at", null: false
    t.string "frequency", null: false
    t.datetime "last_run_at"
    t.string "last_run_status"
    t.string "name", null: false
    t.datetime "next_run_at"
    t.string "robot_name", null: false
    t.datetime "scheduled_at", null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_schedules_on_company_id"
    t.index ["next_run_at"], name: "index_schedules_on_next_run_at"
    t.index ["status"], name: "index_schedules_on_status"
  end

  add_foreign_key "executions", "companies"
  add_foreign_key "executions", "schedules"
  add_foreign_key "log_entries", "executions"
  add_foreign_key "robot_edit_logs", "robots"
  add_foreign_key "robot_versions", "robots"
  add_foreign_key "schedules", "companies"
end

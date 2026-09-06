class AddManagementFieldsToCompanies < ActiveRecord::Migration[8.1]
  def change
    add_column :companies, :code, :text
    add_column :companies, :company_folder, :text
    add_column :companies, :tax_regime, :text
    add_column :companies, :simple_national_opt_in, :boolean, default: false, null: false
    add_column :companies, :pis_pasep, :text
    add_column :companies, :monetary_variation, :text
    add_column :companies, :account_number, :text
    add_column :companies, :access_password, :text
    add_column :companies, :secret_phrase, :text

    add_index :companies, :code, unique: true
  end
end

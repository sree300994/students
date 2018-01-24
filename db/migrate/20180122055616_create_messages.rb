class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.string :title
      t.text :body
      t.attachment :video
      t.integer :user_id

      t.timestamps null: false
    end
  end
end

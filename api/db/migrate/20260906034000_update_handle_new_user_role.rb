class UpdateHandleNewUserRole < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.profiles (
          id,
          name,
          email,
          role,
          created_at
        )
        VALUES (
          new.id,
          COALESCE(
            new.raw_user_meta_data ->> 'name',
            split_part(new.email, '@', 1)
          ),
          new.email,
          'OPERATOR',
          now()
        )
        ON CONFLICT (id) DO NOTHING;

        RETURN new;
      END;
      $$;
    SQL
  end

  def down
    execute <<~SQL
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.profiles (
          id,
          name,
          role
        )
        VALUES (
          new.id,
          COALESCE(
            new.raw_user_meta_data ->> 'name',
            split_part(new.email, '@', 1)
          ),
          'VIEWER'
        )
        ON CONFLICT (id) DO NOTHING;

        RETURN new;
      END;
      $$;
    SQL
  end
end
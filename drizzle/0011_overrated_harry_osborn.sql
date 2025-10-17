CREATE VIEW "public"."v_contributions" AS (
    SELECT
        c.id AS checkin_id,
        c.fairteiler_id AS fairteiler_id,
        c.created_at AS contribution_date,
        c.user_id AS user_id,
        c.quantity AS quantity,
        c.shelf_life AS shelf_life,
        f.id AS food_id,
        f.title AS food_title,
        f.cool AS food_cool,
        f.allergens AS food_allergens,
        f.comment AS food_comment,
        f.company AS food_company,
        u.name AS user_name,
        u.email AS user_email,
        u.image AS user_image,
        ft.name AS fairteiler_name,
        cat.id AS category_id,
        cat.name AS category_name,
        cat.image AS category_image,
        o.id AS origin_id,
        o.name AS origin_name,
        comp.id AS company_id,
        comp.name AS company_name
    FROM
        "checkin" c 
    LEFT JOIN
        auth."user" u ON c.user_id = u.id 
    LEFT JOIN
        auth.fairteiler ft ON c.fairteiler_id = ft.id
    LEFT JOIN
        "food" f ON c.food_id = f.id 
    LEFT JOIN
        "category" cat ON f.category_id = cat.id
    LEFT JOIN
        "origin" o ON f.origin_id = o.id 
    LEFT JOIN
        "company" comp ON f.company_id = comp.id
);
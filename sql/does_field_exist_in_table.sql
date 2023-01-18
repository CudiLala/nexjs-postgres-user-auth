SELECT EXISTS (SELECT 1 FROM $table WHERE $column = $1) as val;

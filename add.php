<?php

//add.php

include('database_connection.php');

$data = array(
 ':name'  => $_POST['name'],
 ':pid' => $_POST['pid'],
 ':type' => $_POST['type']
);


$query = "
 INSERT INTO fileStructure (name, pid,type) VALUES (:name, :pid, :type)
";

$statement = $connect->prepare($query);

if($statement->execute($data))
{
 echo 'Category Added';
}


?>

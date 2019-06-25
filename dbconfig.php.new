<?php
if ( !defined('IN_SMT') )
{
    die ("Permission Error");
}
$dbconfig = array(
    'host' => 'localhost',
    'database' => 'worksheet',
    'username' => 'worksheet',
    'password' => 'Supercuts'
    );
/*
$dbconfig = array(
    'host' => 'sql308.epizy.com',
    'database' => 'epiz_21894646_supertest',
    'username' => 'epiz_21894646',
    'password' => 'DJ9IPUTnbUHS'
    );*/
class worksheet_connection {
    public $conn;
    function __construct($host, $database, $username, $password, $table_prefix = "") {
        $this->conn = new mysqli($host, $username, $password, $database);
        // Check connection
        if ( $this->conn->connect_error ) {
            die("Connection failed: " . $this->conn->connect_error);
        }
        return $this->conn;
    }
    function query($sql)
    {
        $result = $this->conn->query($sql);
        return $result;
    }
    function worksheet_close()
    {
        $this->conn->close();
    }
}
?>
<?php
if ( !defined('IN_SMT') )
{
    die ("Permission Error");
}
define('GUEST_ID', '11');
class AuthUser {
    public $userLoggedIn = false;
    public $s = array();
    function __construct($conn)
    {
        $this->conn = &$conn;
        $this->startSession();
    }
    function startSession( $stylist_id = GUEST_ID )
    {
        $today = time();
        // Remove old sessions
        $sql = "DELETE FROM sessions
            WHERE session_expire < '$today'";
        $result = $this->conn->query($sql);
        // Check if session exists
        $s = isset($this->s) && !empty($this->s) ? $this->s : 
            isset($_COOKIE['session']) ? json_decode($_COOKIE['session'], true) : array();
        
        if ( isset($s['session_id']) && !empty($s['session_id']) && isset($s['session_token']) && !empty($s['session_token']) )
        {
            // Session may exist, but may be expired
            $sql = "
                SELECT * FROM sessions
                WHERE session_id = '{$s['session_id']}'
                AND session_token = '{$s['session_token']}'
                AND session_expire > '$today'
            ";
            $result = $this->conn->query($sql);
            
            if ( $result->num_rows > 0 )
            {
                $s = $result->fetch_assoc();
                $newexpire = $today+24*60*60*14;
                $sql = "UPDATE sessions
                    SET session_expire = '$newexpire'
                    WHERE session_id = '{$s['session_id']}'
                    ";
                $result = $this->conn->query($sql);
            }
            else $s = array();
        }
        else $s = array();
        $token = uniqid();
        $expire = time()+14*24*60*60;
        //start a new guest session
        
            
        if ( empty($s) )
        {
            $sql = "SELECT * FROM stylists
                WHERE stylist_id = '$stylist_id'
                ";
            $result = $this->conn->query($sql);
            if ( $result->num_rows == 0 )
            {
                exit("Config Error");
            }
            $s = $result->fetch_assoc();
            $sql = "INSERT INTO sessions (user_id, session_token, session_expire, session_selector, session_validator) VALUE ('{$s['stylist_id']}','{$token}', '$expire', '', '')";
            $result = $this->conn->query($sql);
            $sql = "SELECT session_id FROM sessions
                WHERE session_token = '$token'
                ";
            $insert_id = $this->conn->query($sql)->fetch_assoc()['session_id'];
            $s = array(
                    'user_id' => $stylist_id,
                    'session_id' => $insert_id,
                    'session_token' => $token,
                    'session_expire' => $expire
                );
        }
        $this->s = $s;
        $this->userLoggedIn = $s['user_id'] != GUEST_ID ? true : false;
        $s = json_encode($s);
        setcookie('session', $s, $expire);
    }
    function logoutUser()
    {
        if ( !isset($this->s['session_id']) )
        {
            $sql = "DELETE FROM sessions
                WHERE session_id = '{$this->s['session_id']}'";
            $result = $this->conn->query($sql);
        }
        if ( isset($_COOKIE['session']) )
        {
            setcookie('session', '', time()-3600);
            $_COOKIE['session'] = '';
        }
        $this->s = array();
    }
    function loginUser()
    {
        $u = array(
            'user_name' => isset($_POST['user_name']) ? $_POST['user_name'] : '',
            'user_pass' => md5(isset($_POST['user_pass']) ? $_POST['user_pass'] : ''),
            'remember' => isset($_POST['remember']) ? $_POST['remember'] : ''
        );
       // if ( empty($u['user_name']) || empty($u['user_pass']) ) return;
        $this->logoutUser();
        $sql = "
            SELECT * FROM stylists
            WHERE stylist_name = '{$u['user_name']}'
            AND stylist_pass = '{$u['user_pass']}'
            ";
        $result = $this->conn->query($sql);
        if ( $result->num_rows != 0 ){
            return $this->startSession($result->fetch_assoc()['stylist_id']);
        }
        return $this->startSession();
    }
    function loginNobody() {
        $this->loginUser();
    }
    function createUser()
    {
    }
    function deleteUser()
    {
    }
    function editUser()
    {
    }
}
?>
<?php
    /*  */
define('IN_SMT', TRUE);


function RandomString()
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randstring = '';
    for ($i = 0; $i < 10; $i++) {
        $randstring = $characters[rand(0, strlen($characters))];
    }
    return $randstring;
}

include "dbconfig.php";
include "auth.php";
include "worksheet.php";

$myWorkSheet = new WorkSheet("Application Name Goes Here");
$myUserAuth = new AuthUser( $myWorkSheet->conn) ;

?>
<html>
<head>
<title>Application Name Goes Here</title>
<meta http-equiv="cache-control" content="no-cache" />
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />
<link rel="stylesheet" type="text/css" href="style.css?<?php echo RandomString(); ?>" />
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script src="javascript.js?<?php echo RandomString(); ?>"></script>
</head>
<body>
<h1 style="font-size: 50px">Application Name Goes Here</h1>
<div id="menu">
    <ul class="ml1" style="border:1px solid black; max-width: 700px">
    <?php
        if ( !($myUserAuth->userLoggedIn == true) )
        {
    ?>
        <li>
            <form method="post" action="index.php">
            <div>
                <p>Login</p>
                <ul class="ml2">
                    <li><input type="text" name="user_name" id="user_name" value="Username"/></li>
                    <li><input type="password" name="user_pass" id="user_pass" value="Password" /></li>
                    <li><input type="checkbox" name="remember" id="remember" value="1" /> Remember Me</li>
                    <li id="login_button"><input type="submit" value="Login" /></li>
                </ul>
            </div>
            </form>
        </li>
    <?php
        }
    ?>
        <li>
            <div>
            <a href="index.php?action=ppw">Pay Period Worksheet</a></a>
            <ul class="ml2">
                <li><a href="index.php?action=editpp">Add / Edit Pay Period Data</a></li>
                <li><a href="index.php?action=editpp">Simple Budgeting Tool</a></li>
            </ul>
            </div>
        </li>
        <li><a href="index.php?action=">My Goals</a></li>
        <li><a href="index.php?action=">Record Tips</a></li>
    <?php
        if ( $myUserAuth->userLoggedIn == true )
        {
    ?>
        <li id="logout_button"></li>
    <?php
        }
    ?>
    </ul>
</div>
<?php
switch ( $myWorkSheet->action )
{
    case 'editpp':
        include("newpp.php");
        break;
    case 'ppw':
    case 'newpp':
        include("{$myWorkSheet->action}.php");
        break;
}
?>
</body>
</html>
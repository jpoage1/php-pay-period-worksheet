<?php
if ( !defined('IN_SMT') )
{
    die ("Permission Error");
}
echo "<div id=\"stylist_selector\">";
echo "<form method=\"get\" action=\"index.php\">";
echo "<input type=\"hidden\" name=\"action\" id=\"action\" value=\"ppw\" />";
echo "<ul>";
echo "<li>";$myWorkSheet->dropMenu('Select Your Region', 'region_id', '', 'regions', 'region_id', 'region_name'); echo "</li>"; // Region
echo "<li>";$myWorkSheet->dropMenu('Select Your District', 'district_id', '', 'districts', 'district_name'); echo "</li>"; // District
echo "<li>";$myWorkSheet->dropMenu('Select a Salon', 'salon_id', 'showStylists(this.value, true)', 'salons', 'salon_id', 'salon_name'); echo "</li>";
echo "<li>";$myWorkSheet->dropMenu('Select a Stylist', 'stylist_id', 'showPayPeriods(this.value, true)', 'stylists', 'stylist_id', 'stylist_name'); echo "</li>";
echo "<li><select name=\"pp_date\" id=\"pp_date\" onchange=\"setPayPeriod(this.value,true)\">";

$sql = "SELECT DISTINCT pp_date FROM pay_period"
        ." WHERE "
        .(
            !empty($myWorkSheet->salon_id) ? "salon_id = '{$myWorkSheet->salon_id}' AND " : '' )
        .(
            !empty($myWorkSheet->stylist_id) ? "stylist_id = '{$myWorkSheet->stylist_id}' AND " : '' )
        ."1 = 1
        ORDER BY pp_date DESC
    ";
$result = $myWorkSheet->conn->query($sql);
echo "<option value=\"0\">Select a Pay Date</option>";
if ( $result->num_rows > 0 )
{
    while ( $row = $result->fetch_assoc() )
    {
        echo "<option value=\"".current($row)."\"";
        if ( current($row) == $myWorkSheet->pp_date )
        {
            echo " selected=\"selected\"";
        }
        echo ">".current($row)."</option>";
    }
}
echo "</select></li>";
echo "<li>";$myWorkSheet->dropMenu('Send Image to Stylist'); echo "</li>"; // Region
echo "</ul>";
echo "</form>";
echo "</div>";
echo "<br/>";
echo "<br/>";
echo "<div id=\"ppw\">";
$myWorkSheet->ppw();
echo "</div>";
?>
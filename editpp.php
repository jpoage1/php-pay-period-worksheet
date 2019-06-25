<?php
if ( !defined('IN_SMT') )
{
    die ("Permission Error");
}
echo "<table>";
echo "<tr class=\"{$myWorkSheet->altN}\">";
echo "<th>";

$myWorkSheet->altN = "1";
$myWorkSheet->worksheet_name = $worksheet_name;
echo "<h1>".$myWorkSheet->worksheet_name."</h1>";
echo "<form method=get>";
echo "<table>";
echo "<tr>";
echo "<td>Salon</td>";
echo "<td>Stylist</td>";
echo "<td>Pay Period Date</td>";
echo "<td></td>";
echo "</tr>";
echo "<tr>";
echo "<td>";$myWorkSheet->dropMenu('salon_id', 'showStylists(this.value)', 'salons', 'salon_id', 'salon_name'); echo "</td>";
echo "<td>";$myWorkSheet->dropMenu('stylist_id', 'showPayPeriods(this.value)', 'stylists', 'stylist_id', 'stylist_name'); echo "</td>";
echo "<td><select name=\"pp_date\" id=\"pp_date\">";

$sql = "SELECT DISTINCT pp_date FROM pay_period"
                        ." WHERE "
                        .(
                            !empty($myWorkSheet->salon_id) ? "salon_id = '{$myWorkSheet->salon_id}' AND " : '' )
                        .(
                            !empty($myWorkSheet->stylist_id) ? "stylist_id = '{$myWorkSheet->stylist_id}' AND " : '' )
                        ."1 = 1";
$result = $myWorkSheet->conn->query($sql);
echo "<option>&nbsp;</option>";
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
echo "</select></td>";
echo "<td><input type=\"submit\" /></td>";
echo "</tr>";
echo "</table>";
echo "</form>";
echo "</th>";
echo "<th>Pay Period Date</th>";
echo "<th>Product Hours</th>";
echo "<th>Non-Product Hours</th>";
echo "<th>Hourly Base</th>";
echo "<th>Commissionable Service Revenue</th>";
echo "<th>Service Commission Rate</th>";
echo "<th>Product Sales</th>";
if ( count($myWorkSheet->worksheetData['stylists']) == 1 )
    echo "<th>Stylist Average</th>";
if ( is_array($myWorkSheet->worksheetData['stylists']) && !empty($myWorkSheet->worksheetData['stylists']) )
foreach ( $myWorkSheet->worksheetData['stylists'] as $column )
{
    echo "<th>".$column['stylist_name']."</th>";
}
echo "</tr>";

echo "</table>";
return true;
?>
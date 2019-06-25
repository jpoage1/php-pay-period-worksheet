
<form method="post" action="index.php?action=newpp&pp_date=<?php echo $myWorkSheet->pp_date;?>&salon_id=<?php echo $myWorkSheet->salon_id;?>&stylist_id=<?php echo $myWorkSheet->stylist_id;?>">
<input type="hidden" name="action" value="newpp" />
<div id="newPayPeriod" style="border-top: 1px dashed black; border-right: 1px dashed black; border-top: 1px dashed black; margin-top: 5px; margin-left: -5px; padding-left: 5px; max-width:700px">
    
    <table>
        <thead>
        <tr>
            <th colspan="2"><h3>Manage Pay Period Entries</h3></th>
        </tr>
        <tr>
            <td colspan="2" style="text-align:center">In SuperSalon, go to Reports -> Sales -> Production.<br />Select the date, and then if applicable, select a stylist.</td>
        </tr>
        </thead>
        <tbody>
        <tr>
            <th>Salon</th>
            <td><input type="checkbox" onchange="toggleCreate(this, 'salon', 'Salon')" id="new_salon" value="1" style="margin-left: -15px; padding-left: 0px" /><span id="salon_menu"><?php $myWorkSheet->dropMenu('Select a Salon','salon_id', 'setStylistSalon(this.value, false)', 'salons', 'salon_id', 'salon_name'); ?></span><span id="salon_input"></span></td>
        </tr>
        <tr>
            <th>Stylist</th>
            <td><input type="checkbox" onchange="toggleCreate(this, 'stylist', 'Stylist')"  id="new_stylist" value="1" style="margin-left: -15px; padding-left: 0px" /><span id="stylist_menu"><?php $myWorkSheet->dropMenu('Select a Stylist','stylist_id', 'setStylistData(this.value)', 'stylists', 'stylist_id', 'stylist_name'); ?></span><span id="stylist_input"></span></td>
        </tr>
        <tr>
            <th>Pay Day</th>
            <td>
                <ul style="list-style-type: none; padding-left: 0px; margin-left: -15px">
                    <li>
                        <input type="radio" name="pp_date_radio" value="DropMenu" /><?php
                        
                        echo "<select name=\"pp_date_menu\" id=\"pp_date_menu\" onchange=\"setPayPeriodData(this.value, 'DropMenu')\">";


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
echo "</select>"; ?>
                    </li>
                    <li>
                        <input type="radio" name="pp_date_radio" value="Calendar" />
                        <input type="text" name="pp_date_calendar" id="pp_date_calendar" value="Click for Calendar" onchange="setPayPeriodData(this.value, 'Calendar')" />
                    </li>
                </ul>
            </td>
        </tr>
        </tbody>
        <tfoot>
            <tr>
                <th colspan="2" id="action_label"></th>
            </tr>
            <tr>
                <td colspan="2"><table>
                    <tr></tr>
                </table></td>
            </tr>
        <tr>
            <th>Total Product Hours</th>
            <td><input type="text" name="pp_product_hours" id="pp_product_hours" value="" /></td>
        </tr>
        <tr>
            <th>Total Non-Product Hours</th>
            <td><input type="text" name="pp_nonproduct_hours" id="pp_nonproduct_hours" value="" /></td>
        </tr>
        <tr>
            <th>Hourly Base Pay</th>
            <td><input type="text" name="pp_hourly_base" id="pp_hourly_base" value="11.00" />/hr</td>
        </tr>
        <tr>
            <th>Commissionable Service Revenue</th>
            <td>$<input type="text" name="pp_commissionable_service" id="pp_commissionable_service" value="" /></td>
        </tr>
        <tr>
            <th>Service Commission Rate</th>
            <td><input type="text" name="pp_service_commission_rate" id="pp_service_commission_rate" value="38" />%</td>
        </tr>
        <tr>
            <th>Product Sales</th>
            <td>$<input type="text" name="pp_product_sales" id="pp_product_sales" value="" /></td>
        </tr>
        <tr>
            <td style="text-align: right"></td>
            <td id="save_pp_button"><input type="submit" id="save_pp_text" value="Save" /></td>
        </tr>
        </tfoot>
    </table>
</div>
</form>
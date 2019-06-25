<?php
if ( !defined('IN_SMT') )
{
    die ("Permission Error");
}
class WorkSheet {
    /* add a new row to the worksheet for calculation or fetching */
    public $wRows = array();
    public $wColumns = array();
    public $worksheet_name = "";
    public $conn;
    public $pp_date;
    function __construct()
    {
        global $dbconfig;
        $this->conn = new worksheet_connection($dbconfig['host'], $dbconfig['database'], $dbconfig['username'], $dbconfig['password']);// Check connection
        unset($dbconfig);

        
        if ( $this->conn->connect_error ) {
            die("Connection failed: " . $this->conn->connect_error);
        }
        $this->action = isset($_GET['action']) && !empty($_GET['action']) ? $_GET['action'] : '';
        $this->salon_id = isset($_GET['salon_id']) && !empty($_GET['salon_id']) ? $_GET['salon_id'] : '';
        $this->stylist_id = isset($_GET['stylist_id']) && !empty($_GET['stylist_id']) ? $_GET['stylist_id'] : '';
        $this->pp_date =  isset($_GET['pp_date']) && !empty($_GET['pp_date']) ? $_GET['pp_date'] : '';
        
        $this->processData();
        $this->populateData();
        return $this->conn;
    }
    function processData()
    {
        switch ( $this->action )
        {
            case 'newpp':
                $pp = array(
                    'salon_id' => isset($_POST['salon_id']) && !empty($_POST['salon_id']) ? $_POST['salon_id'] : '',
                    'stylist_id' => isset($_POST['stylist_id']) && !empty($_POST['stylist_id']) ? $_POST['stylist_id'] : '',
                    'pp_date' => isset($_POST['pp_date']) && !empty($_POST['pp_date']) ? $_POST['pp_date'] : '',
                    'pp_product_hours' => isset($_POST['pp_product_hours']) && !empty($_POST['pp_product_hours']) ? $_POST['pp_product_hours'] : '',
                    'pp_nonproduct_hours' => isset($_POST['pp_nonproduct_hours']) && !empty($_POST['pp_nonproduct_hours']) ? $_POST['pp_nonproduct_hours'] : '',
                    'pp_hourly_base' => isset($_POST['pp_hourly_base']) && !empty($_POST['pp_hourly_base']) ? $_POST['pp_hourly_base'] : '',
                    'pp_commissionable_service' => isset($_POST['pp_commissionable_service']) && !empty($_POST['pp_commissionable_service']) ? $_POST['pp_commissionable_service'] : '',
                    'pp_service_commission_rate' => isset($_POST['pp_service_commission_rate']) && !empty($_POST['pp_service_commission_rate']) ? $_POST['pp_service_commission_rate']/100 : '',
                    'pp_product_sales' => isset($_POST['pp_product_sales']) && !empty($_POST['pp_product_sales']) ? $_POST['pp_product_sales'] : ''
                );
                $pp['pp_date'] = new DateTime($pp['pp_date']);
                $pp['pp_date'] = $pp['pp_date']->format('Y-m-d');
                // need a better way to verify data coming in, especially to verify decimal format matches sql database but this is a start
                if ( !is_numeric($pp['pp_product_hours']) || $pp['pp_product_hours'] === '' ) $pp['pp_product_hours'] = '0';
                if ( !is_numeric($pp['pp_nonproduct_hours']) || $pp['pp_nonproduct_hours'] === '' ) $pp['pp_nonproduct_hours'] = '0';
                if ( !is_numeric($pp['pp_commissionable_service']) || $pp['pp_commissionable_service'] === '' ) $pp['pp_commissionable_service'] = '0';
                if ( !is_numeric($pp['pp_product_sales']) || $pp['pp_product_sales'] === '' ) $pp['pp_product_sales'] = '0';
                
                $sql = "
                    INSERT INTO pay_period (salon_id, stylist_id, pp_date, pp_product_hours, pp_nonproduct_hours, pp_hourly_base, pp_commissionable_service, pp_service_commission_rate, pp_product_sales)
                    VALUES ('{$pp['salon_id']}', '{$pp['stylist_id']}', '{$pp['pp_date']}', '{$pp['pp_product_hours']}', '{$pp['pp_nonproduct_hours']}', '{$pp['pp_hourly_base']}', '{$pp['pp_commissionable_service']}', '{$pp['pp_service_commission_rate']}', '{$pp['pp_product_sales']}')";
                $result = $this->conn->query($sql);
                print $sql."<br>".$this->conn->error;
                break;
            case '':
                break;
            case '':
                break;
        }
        return false;
    }
    function populateData() {
        if ( $this->pp_date != '' )
        {
            
            $sql = "SELECT pp_date FROM pay_period, stylists
                WHERE pay_period.stylist_id = stylists.stylist_id
                AND pp_date = '{$this->pp_date}'
                ";
            $result = $this->conn->query($sql);
            $row = $result->fetch_assoc();
            if ( $result->num_rows == 0 )
            {
                $this->pp_date = '';
            }
        }
        // we arent using an else statement on purpose, because this next line is dependent on the result of the above
        if ( $this->pp_date == '' )
        {
            $sql = "SELECT pp_date FROM pay_period, stylists
                WHERE pay_period.stylist_id = stylists.stylist_id
                ORDER BY pp_date DESC
                ";
            $result = $this->conn->query($sql);
            $row = $result->fetch_assoc();
            if ( $result->num_rows > 0 )
            {
                $this->pp_date = current($row);
            }
        }
        // Populate worksheet array
        $sql = "SELECT * FROM pay_period, stylists
            WHERE pp_date = '".$this->pp_date."'
            AND pay_period.stylist_id = stylists.stylist_id
            ";
        $result = $this->conn->query($sql);
        while ( $row = $result->fetch_assoc() )
        {
            $row['hourly_gross'] = $row['pp_product_hours']*$row['pp_hourly_base'];
            $row['nonproduct_wages'] = $row['pp_nonproduct_hours']*$row['pp_hourly_base'];
            $row['service_commission'] = $row['pp_commissionable_service']*$row['pp_service_commission_rate'];
            $row['product_commission_15'] = round(($row['pp_product_sales'] < 250 ? $row['pp_product_sales'] : 250)*.15,2);
            $row['product_commission_20'] = round(($row['pp_product_sales'] > 250 ? ( $row['pp_product_sales'] < 500 ? $row['pp_product_sales']-250 : 250) : 0)*0.2,2);
            $row['product_commission_25'] = round(($row['pp_product_sales'] > 500 ? $row['pp_product_sales']-500 : 0)*0.25,2);
            $row['product_commission'] = $row['product_commission_15']+$row['product_commission_20']+$row['product_commission_25'];
            $row['total_earned_service'] = $row['product_commission']+$row['service_commission'];
            $row['actual_paycheck'] = $row['nonproduct_wages']+( $row['service_commission'] > $row['hourly_gross'] ? $row['total_earned_service'] : $row['hourly_gross']);
            
            $row['divide_product_hours'] = $row['pp_product_hours'];
            $row['total_hourly_pay'] = round($row['actual_paycheck'] / $row['pp_product_hours'], 2);
            $row['gross_revenue'] = $row['pp_commissionable_service']+$row['pp_product_sales'];
            $row['percent_product_sales'] = round($row['pp_product_sales']/$row['gross_revenue']*100,2);
            $row['percent_service_commission'] = round($row['actual_paycheck']/$row['pp_commissionable_service']*100,2);
            $row['percent_product_commission'] = $row['pp_product_sales'] != 0 ? round($row['product_commission']/$row['pp_product_sales']*100,2) : 0;
            $worksheetData[] = $row;
        }
        $this->worksheetData = $worksheetData;
        return true;
    }
    function payPeriodWorksheet($worksheet_name = "") {
        
        echo "<table>";
        echo "<tr class=\"{$this->altN}\">";
        /*
        echo "<th>";
        $this->altN = "1";
        $this->worksheet_name = $worksheet_name;
        echo "<h1>".$this->worksheet_name."</h1>";
        echo "<form method=get>";
        echo "<table>";
        echo "<tr>";
        echo "<td>Salon</td>";
        echo "<td>Stylist</td>";
        echo "<td>Pay Period Date</td>";
        echo "<td></td>";
        echo "</tr>";
        echo "<tr>";
        echo "<td>";$this->salonDropMenu(); echo "</td>";
        echo "<td>";$this->stylistDropMenu(); echo "</td>";
        echo "<td><select name=\"pp_date\">";
        
        $sql = "SELECT DISTINCT pp_date FROM pay_period";
        $result = $this->conn->query($sql);
        if ( $result->num_rows > 0 )
        {
            while ( $row = $result->fetch_assoc() )
            {
                echo "<option value=\"".current($row)."\"";
                if ( current($row) == $this->pp_date )
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
        echo "<table>";
        echo "<tr>";
        echo "<td>Salon</td>";
        echo "<td>Stylist</td>";
        echo "<td>Pay Period Date</td>";
        echo "<td></td>";
        echo "</tr>";
        echo "<tr>";
        echo "<td>";$this->salonDropMenu(); echo "</td>";
        echo "<td>";$this->stylistDropMenu(); echo "</td>";
        echo "<td><select name=\"pp_date\">";
        
        $sql = "SELECT DISTINCT pp_date FROM pay_period";
        $result = $this->conn->query($sql);
        if ( $result->num_rows > 0 )
        {
            while ( $row = $result->fetch_assoc() )
            {
                echo "<option value=\"".current($row)."\"";
                if ( current($row) == $this->pp_date )
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
        */
        echo "<th>Salon Total</th>";
        echo "<th>Salon Average</th>";
        echo "<th>Stylist Average</th>";
        foreach ( $this->worksheetData as $column )
        {
            echo "<th>".$column['stylist_name']."</th>";
        }
        echo "</tr>";

        $this->insertRow("Total Product Hours",'pp_product_hours');
        $this->insertRow("Hourly Base Pay",'pp_hourly_base');
        $this->insertRow("Gross Pay based on Hourly Pay",'hourly_gross');
        $this->insertRow("Commissionable Service Total",'pp_commissionable_service');
        $this->insertRow("Service Commission Rate",'pp_service_commission_rate');
        $this->insertRow("Service Commission Earned",'service_commission');
        $this->insertRow("Product Sales",'pp_product_sales');
        $this->insertRow("Sales from $1  to $250 earns 15% commission",'product_commission_15');
        $this->insertRow("Sales from $250.01  to $500 earns 20% commission",'product_commission_20');
        $this->insertRow("Sales above $500 earns 25% commission",'product_commission_25');
        $this->insertRow("Product Commission",'product_commission');
        $this->insertRow("Total Earned Service ",'total_earned_service');
        $this->insertRow("Non Productive Hours ",'pp_nonproduct_hours');
        $this->insertRow("Non Productive Wages ",'nonproduct_wages');
        $this->insertRow("Actual Paycheck",'actual_paycheck');
        $this->insertRow("Divide by Numbers of Production Hours", 'divide_product_hours');
        $this->insertRow("Total Hourly Pay Earned",'total_hourly_pay');
        $this->insertRow("Stylist Gross Revenue",'gross_revenue');
        $this->insertRow("% of Product Sales from Gross Revenue", 'percent_product_sales');
        $this->insertRow("% of Service Commissions from Gross Revenue", 'percent_service_commission');
        $this->insertRow("% Product Commission from Gross Service Revenue", 'percent_product_commission');
        echo "</table>";
        return true;
    }
    function altNCh()
    {

        return $this->altN = $this->altN == "alt1" ? "alt2" : "alt1";
    }
    function insertRow($row_title, $row = '') {
        $this->altNCh();
        echo "<tr class=\"{$this->altN}\">";
        echo "<th colspan=\"".(count($this->worksheetData)+3)."\">$row_title</td>";
        echo "</tr>";
        echo "<tr class=\"{$this->altN}\">";
        if ( $row != "" )
        {
            echo "<td>".$this->totalData($row)."</td>";
            echo "<td>".$this->averageSalonData($row)."</td>";
            echo "<td>".$this->averageSalonData($row)."</td>";
            foreach ( $this->worksheetData as $column )
            {
                echo "<td>".$column[$row]."</td>";
            }
        }
        echo "</tr>";
    }
    function averageSalonData($row_name)
    {
        if ( $row_name != "" )
        {
            $x = 0;
            for ( $i = 0; $i < count($row_name); $i++ )
            {
                if ( isset($this->worksheetData[$i][$row_name]) )
                {
                    $x+= $this->worksheetData[$i][$row_name];
                }
            }
            $x = $x/$i;
            return $x;
        }
        return false;
    }
    function averageStylistData($row_name)
    {
        if ( $row_name != "" )
        {
            $x = 0;
            for ( $i = 0; $i < count($row_name); $i++ )
            {
                if ( isset($this->worksheetData[$i][$row_name]) )
                {
                    $x+= $this->worksheetData[$i][$row_name];
                }
            }
            $x = $x/$i;
            return $x;
        }
        return false;
    }
    
    function totalData($row_name)
    {
        if ( $row_name != "" )
        {
            $x = 0;
            for ( $i = 0; $i < count($row_name); $i++ )
            {
                if ( isset($this->worksheetData[$i][$row_name]) )
                {
                    $x+= $this->worksheetData[$i][$row_name];
                }
            }
            return $x;
        }
        return false;
    }
    function salonDropMenu()
    {
        ?>
        <select name="salon_id" id="salon_id"><?php
            echo "<option>&nbsp;</option>";
            // Populate worksheet array
        $sql = "SELECT * FROM salons";
        $result = $this->conn->query($sql);
        while ( $row = $result->fetch_assoc() )
        {
            echo "<option value=\"".$row['salon_id']."\"".($this->salon_id == $row['salon_id'] ? " selected=\"selected\"" : "").">".$row['salon_name']."</option>";
        }
            ?></select><?php
    }
    function stylistDropMenu() {
        ?>
        <select name="stylist_id" id="stylist_id"><?php
            echo "<option>&nbsp;</option>";
            // Populate worksheet array
        $sql = "SELECT * FROM stylists";
        $result = $this->conn->query($sql);
        if ($result->num_rows > 0 )
        {
            while ( $row = $result->fetch_assoc() )
            {
                echo "<option value=\"".$row['stylist_id']."\"".($this->stylist_id == $row['stylist_id'] ? " selected=\"selected\"" : "").">".$row['stylist_name']."</option>";
            }
        }
            ?></select><?php
    }
}

?>
<?php
class WorkSheet {
    /* add a new row to the worksheet for calculation or fetching */
    $wRows = array();
    $wColumns = array();
    $worksheet_name = "";
    $conn;
    $pp_date;
    function __construct()
    {
        global $dbconfig;
        $this->conn = new worksheet_connection($dbconfig['host'], $dbconfig['database'], $dbconfig['username'], $dbconfig['password']);// Check connection
        unset($dbconfig);

        
        if ( $this->conn->connect_error ) {
            die("Connection failed: " . $this->conn->connect_error);
        }
        
        $this->action = isset($_GET['action']) && !empty($_GET['action']) ? $_GET['action'] : 'menu';
        $this->fetch = isset($_GET['fetch']) && !empty($_GET['fetch']) ? $_GET['fetch'] : '';
        $this->salon_id = isset($_GET['salon_id']) && !empty($_GET['salon_id']) && is_numeric($_GET['salon_id']) ? $_GET['salon_id'] : '';
        $this->stylist_id = isset($_GET['stylist_id']) && !empty($_GET['stylist_id']) && is_numeric($_GET['stylist_id']) ? $_GET['stylist_id'] : '';
        $this->pp_date =  isset($_GET['pp_date']) && !empty($_GET['pp_date']) && $_GET['pp_date'] != 0 ? $_GET['pp_date'] : '';
        if ( $this->pp_date != '' )
        {
            $this->pp_date = new DateTime($this->pp_date);
            $this->pp_date = $this->pp_date->format('Y-m-d');
        }
        if ( !( ($this->action == 'fetch' && $action->fetch == 'ppw') || $this->action == 'newpp') )
        {
            $this->populateData('stylists'); // For loading search results (mostly used for managers)
            if ( $this->showStylistAverage() )
                $this->populateData('stylist'); // For loading indivindual stylist's stats
            $this->populateData('salon_period'); // For calculating salon statistics
            $this->populateData('salon_gross'); // For calculating salon statistics
        }
        $this->processData();
        return $this->conn;
    }
    function ShowStylistAverage()
    {
        if ( count($this->worksheetData['stylists']) == 1 )
        {
            return true;
        }
        return false;
    }
    function ShowPeriodSalonAverage()
    {
        if ( $this->pp_date == 0 )
        {
            return false;
        }
        return true;
    }
    function processData()
    {
        global $myUserAuth;
        if ( $_SERVER['REQUEST_METHOD'] == 'POST' )
            $this->action = isset($_POST['action']) && !empty($_POST['action']) ? $_POST['action'] : $this->$action;
   //     print_r($_POST);die;
        switch ( $this->action )
        {
            case 'logout':
                $myUserAuth = new AuthUser( $this->conn);
                $myUserAuth->logoutUser();
                unset($myUserAuth);
                break;
            case 'login':
                $myUserAuth = new AuthUser( $this->conn);
                $myUserAuth->loginUser();
                print_r(json_encode($myUserAuth->s));
                exit;
            case 'fetch':
                if ( !empty($this->fetch) )
                {
                    switch ( $this->fetch )
                    {
                            /*
                            */
                        case 'session':
                            $myUserAuth = new AuthUser( $this->conn);
                            print_r(json_encode($myUserAuth->s));
                            exit;
                        case 'stylistData':
                            $sql = "SELECT stylist_commission, stylist_base FROM stylists"
                                .( !empty($this->stylist_id) ? " WHERE stylist_id = '{$this->stylist_id}'" : '');
                            //die ($sql);
                            $result = $this->conn->query($sql);
                            if ( $result->num_rows == 0 ) break;
                            $row = $result->fetch_assoc();
                            echo json_encode($row);
                            $result->close();
                            exit; // exitting gracefully
                        case 'stylists':
                            $sql = "SELECT * FROM stylists
                                WHERE "
                                .(
                                    !empty($this->salon_id) ? "salon_id = '{$this->salon_id}' AND " : '' )
                                ."1 = 1";
                            break;
                        case 'pay_period':
                            $sql = "SELECT * FROM pay_period"
                                ." WHERE "
                                .(
                                    !empty($this->pp_date) ? "pp_date = '{$this->pp_date}' AND " : '' )
                                .(
                                    !empty($this->salon_id) ? "salon_id = '{$this->salon_id}' AND " : '' )
                                .(
                                    !empty($this->stylist_id) ? "stylist_id = '{$this->stylist_id}' AND " : '' )
                                ."1 = 1";
                            break;
                        case 'pay_periods':
                            $sql = "SELECT DISTINCT pp_date FROM pay_period"
                                ." WHERE "
                                .(
                                    !empty($this->pp_date) ? "pp_date = '{$this->pp_date}' AND " : '' )
                                .(
                                    !empty($this->salon_id) ? "salon_id = '{$this->salon_id}' AND " : '' )
                                .(
                                    !empty($this->stylist_id) ? "stylist_id = '{$this->stylist_id}' AND " : '' )
                                ."1 = 1"
                                ." ORDER BY pp_date DESC";
                            break;
                        case 'ppw':
                            $this->ppw();
                            exit; // Exiting gracefully
                    }
                    $result = $this->conn->query($sql);
                    $results = array();
                    while ( $row = $result->fetch_assoc() )
                    {
                        $results[]=$row;
                    }
                    $result->close();
                    echo json_encode($results);
                }
                exit; // Exiting gracefully
            case 'newpp':
                $pp = array(
                    'salon_id' => isset($_POST['salon_id']) && !empty($_POST['salon_id']) && is_numeric($_POST['salon_id']) ? $_POST['salon_id'] : '',
                    'stylist_id' => isset($_POST['stylist_id']) && !empty($_POST['stylist_id']) && is_numeric($_POST['stylist_id']) ? $_POST['stylist_id'] : '',
                    'pp_date' => isset($_POST['pp_date']) && !empty($_POST['pp_date']) ? $_POST['pp_date'] : 
                        (isset($_POST['pp_date_radio']) && $_POST['pp_date_radio'] == 'Calendar' ? $_POST['pp_date_calendar'] : 
                        (isset($_POST['pp_date_radio']) && $_POST['pp_date_radio'] == 'DropMenu' ? $_POST['pp_date_menu'] : '')),
                    'pp_product_hours' => isset($_POST['pp_product_hours']) && !empty($_POST['pp_product_hours']) ? $_POST['pp_product_hours'] : '',
                    'pp_nonproduct_hours' => isset($_POST['pp_nonproduct_hours']) && !empty($_POST['pp_nonproduct_hours']) ? $_POST['pp_nonproduct_hours'] : '',
                    'pp_hourly_base' => isset($_POST['pp_hourly_base']) && !empty($_POST['pp_hourly_base']) ? $_POST['pp_hourly_base'] : '',
                    'pp_commissionable_service' => isset($_POST['pp_commissionable_service']) && !empty($_POST['pp_commissionable_service']) ? $_POST['pp_commissionable_service'] : '',
                    'pp_service_commission_rate' => isset($_POST['pp_service_commission_rate']) && !empty($_POST['pp_service_commission_rate']) ? $_POST['pp_service_commission_rate']/100 : '',
                    'pp_product_sales' => isset($_POST['pp_product_sales']) && !empty($_POST['pp_product_sales']) ? $_POST['pp_product_sales'] : '',
                    
                    'new_stylist' => isset($_POST['new_stylist']) && !empty($_POST['new_stylist']) ? $_POST['new_stylist'] : '',
                    
                    'new_stylist_name' => isset($_POST['new_stylist_name']) && !empty($_POST['new_stylist_name']) ? $_POST['new_stylist_name'] : '',
                    'new_salon' => isset($_POST['new_salon']) && !empty($_POST['new_salon'])  ? $_POST['new_salon'] : '',
                    'new_salon_name' => isset($_POST['new_salon_name']) && !empty($_POST['new_salon_name']) ? $_POST['new_salon_name'] : ''
                );
                if ( $_SERVER['REQUEST_METHOD'] == 'POST' )
                {
                    if ( $pp['salon_id'] == '' || $pp['stylist_id'] == ''|| $pp['pp_date'] == '' ) exit ("Nothing to do here");
                    $pp['pp_date'] = new DateTime($pp['pp_date']);
                    $pp['pp_date'] = $pp['pp_date']->format('Y-m-d');

                    // Check if data exists for this pay period and salon already
                    $sql = "SELECT * FROM pay_period
                            WHERE salon_id = '{$pp['salon_id']}'
                            AND stylist_id = '{$pp['stylist_id']}'
                            AND pp_date = '{$pp['pp_date']}'
                        ";
                    $result = $this->conn->query($sql);
                    // need a better way to verify data coming in, especially to verify decimal format matches sql database but this is a start
                    if ( !is_numeric($pp['pp_product_hours']) || $pp['pp_product_hours'] === '' ) $pp['pp_product_hours'] = '0';
                    if ( !is_numeric($pp['pp_nonproduct_hours']) || $pp['pp_nonproduct_hours'] === '' ) $pp['pp_nonproduct_hours'] = '0';
                    if ( !is_numeric($pp['pp_commissionable_service']) || $pp['pp_commissionable_service'] === '' ) $pp['pp_commissionable_service'] = '0';
                    if ( !is_numeric($pp['pp_product_sales']) || $pp['pp_product_sales'] === '' ) $pp['pp_product_sales'] = '0';
                    if ( $result->num_rows > 0 ) 
                    {
                        $sql = "
                        UPDATE pay_period
                        SET pp_product_hours = '{$pp['pp_product_hours']}',
                        pp_nonproduct_hours = '{$pp['pp_nonproduct_hours']}',
                        pp_hourly_base = '{$pp['pp_hourly_base']}',
                        pp_commissionable_service = '{$pp['pp_commissionable_service']}',
                        pp_service_commission_rate = '{$pp['pp_service_commission_rate']}',
                        pp_product_sales = '{$pp['pp_product_sales']}'
                        WHERE salon_id = '{$pp['salon_id']}'
                        AND stylist_id = '{$pp['stylist_id']}'
                        AND pp_date = '{$pp['pp_date']}'";
                    }
                    else
                    {
                        $sql = "
                        INSERT INTO pay_period (salon_id, stylist_id, pp_date, pp_product_hours, pp_nonproduct_hours, pp_hourly_base, pp_commissionable_service, pp_service_commission_rate, pp_product_sales)
                        VALUES ('{$pp['salon_id']}', '{$pp['stylist_id']}', '{$pp['pp_date']}', '{$pp['pp_product_hours']}', '{$pp['pp_nonproduct_hours']}', '{$pp['pp_hourly_base']}', '{$pp['pp_commissionable_service']}', '{$pp['pp_service_commission_rate']}', '{$pp['pp_product_sales']}')";
                    }
                    $result = $this->conn->query($sql);
                    exit; // Exiting Gracefully
                }
            case '':
                break;
            case '':
                break;
        }
        return false;
    }
    function populateData($wsName, $force = false, $wsData = array()) {
        if ( isset($this->worksheetData[$wsName]) && !empty($this->worksheetData[$wsName]) && $force == false )
            return false;
        
        $pp_date_require = true;
        switch ( $wsName )
        {
            case 'region':
                $district = '';
            case 'district':
                $salon = '';
            case 'salon_gross':
                $stylist = '';
                $pp_id = '';
                $pp_date_require = false;
                break;
            case 'salon_period':
                $stylist = '';
                $pp_date_require = true;
                break;
            case 'recent':
                if ( $pp_date_require == true && $this->pp_date == '' )
                {
                    // Get the most recent pay period for the selected criteria
                    $sql = "SELECT pp_date FROM pay_period, stylists
                        WHERE pay_period.stylist_id = stylists.stylist_id"
                                        .( !empty($this->salon_id) ? " AND salon_id = '{$this->salon_id}'" : '' )
                                        .( !empty($this->stylist_id) ? " AND stylist_id = '{$this->stylist_id}' " : '' )
                                        ." ORDER BY pp_date DESC
                        ";
                    $result = $this->conn->query($sql);
                    if ( $result->num_rows > 0 )
                    {
                        $row = $result->fetch_assoc();
                        $this->pp_date = current($row);
                    }
                }
            case 'stylist':
                $pp_id = '';
                $pp_date_require = false;
            case 'stylists':
                $stylist_id = $this->stylist_id;
                break;
        }
        $stylists = array();
        // Populate worksheet array
        $sql = "SELECT * FROM pay_period, stylists
            WHERE pay_period.stylist_id = stylists.stylist_id"
            .( !empty($this->pp_date) && $pp_date_require == true ? " AND pp_date = '".$this->pp_date."'" : '')
            .( !empty($this->salon_id) ? " AND pay_period.salon_id = '{$this->salon_id}'" : '')
            .( !empty($stylist_id) ? " AND pay_period.stylist_id = '{$stylist_id}'" : '')
            ;
        $result = $this->conn->query($sql);
        $ws_totalN = $result->num_rows;
        
        if ( $result->num_rows > 0 )
        {
            while ( $row = $result->fetch_assoc() )
            {
                $stylists[$row['stylist_id']]['stylist_name'] = $row['stylist_name'];
                $stylists[$row['stylist_id']]['stylist_name'].= $this->pp_date == '' && $row['stylist_name'] == $stylists[$row['stylist_id']]['stylist_name'] ? "'s Total" : '';
                $stylists[$row['stylist_id']]['pp_commissionable_service']+= $row['pp_commissionable_service'];

                $stylists[$row['stylist_id']]['service_commission']+= round($row['pp_commissionable_service']*$row['pp_service_commission_rate'],2);
                $stylists[$row['stylist_id']]['pp_product_hours']+= $row['pp_product_hours'];
                $stylists[$row['stylist_id']]['pp_nonproduct_hours']+= $row['pp_nonproduct_hours'];
                $stylists[$row['stylist_id']]['hourly_gross']+= round($row['pp_product_hours']*$row['pp_hourly_base'],2);
                $stylists[$row['stylist_id']]['nonproduct_wages']+= round($row['pp_nonproduct_hours']*$row['pp_hourly_base'],2);
                $stylists[$row['stylist_id']]['pp_product_sales']+= $row['pp_product_sales'];

            }
            $stylists = $this->fillWorkSheet($stylists);
            $this->worksheetData[$wsName] = $stylists;

            $ws_total = array();
            foreach ( $stylists as $row )
            {
                $ws_total['pp_commissionable_service']+= $row['pp_commissionable_service'];
                $ws_total['service_commission']+= round($row['pp_commissionable_service']*$row['pp_service_commission_rate'],2);
                $ws_total['pp_product_hours']+= $row['pp_product_hours'];
                $ws_total['pp_nonproduct_hours']+= $row['pp_nonproduct_hours'];
                $ws_total['hourly_gross']+= round($row['pp_product_hours']*$row['pp_hourly_base'],2);
                $ws_total['nonproduct_wages']+= round($row['pp_nonproduct_hours']*$row['pp_hourly_base'],2);
                $ws_total['pp_product_sales']+= $row['pp_product_sales'];
            }
            $ws_total = $this->fillWorkSheet($ws_total, false);
            $this->worksheetData[$wsName.'_total'] = $ws_total;

            $ws_average = array();
            foreach ( $ws_total as $key => $row )
            {
                $ws_average[$key] = round($row/$ws_totalN,2);
            }
            $ws_average = $this->fillWorkSheet($ws_average, false);
            $this->worksheetData[$wsName.'_average'] = $ws_average;
            return true;   
        }
        return false;
    }
    function fillWorkSheet($stylists, $loop = true) {
        if ( $loop )
            foreach ( $stylists as $key => &$stylist )
            {
                $stylist['pp_hourly_base'] = $stylist['pp_product_hours'] != 0 ? round($stylist['hourly_gross']/$stylist['pp_product_hours'],2) : 0;
                $stylist['product_commission_15'] = round(($stylist['pp_product_sales'] < 250 ? $stylist['pp_product_sales'] : 250)*.15,2);
                $stylist['product_commission_20'] = round(($stylist['pp_product_sales'] > 250 ? ( $stylist['pp_product_sales'] < 500 ? $stylist['pp_product_sales']-250 : 250) : 0)*0.2,2);
                $stylist['product_commission_25'] = round(($stylist['pp_product_sales'] > 500 ? $stylist['pp_product_sales']-500 : 0)*0.25,2);
                $stylist['product_commission'] = round($stylist['product_commission_15']+$stylist['product_commission_20']+$stylist['product_commission_25'],2);
                $stylist['total_earned_service'] = round($stylist['product_commission']+$stylist['service_commission'],2);
                $stylist['actual_paycheck'] = round($stylist['nonproduct_wages']+( $stylist['service_commission'] > $stylist['hourly_gross'] ? $stylist['total_earned_service'] : $stylist['hourly_gross']),2);
                $stylist['pp_service_commission_rate'] = $stylist['pp_commissionable_service'] != 0 ? round($stylist['service_commission'] / $stylist['pp_commissionable_service'],2) : 0;

                $stylist['divide_product_hours'] = $stylist['pp_product_hours'];
                $stylist['total_hourly_pay'] = $stylist['pp_product_hours'] != 0 ? round($stylist['actual_paycheck'] / $stylist['pp_product_hours'], 2) : 0;
                $stylist['gross_revenue'] = round($stylist['pp_commissionable_service']+$stylist['pp_product_sales'],2);
                $stylist['percent_product_sales'] = $stylist['gross_revenue'] != 0 ? round($stylist['pp_product_sales']/$stylist['gross_revenue']*100,2) : 0;
                $stylist['percent_service_commission'] = $stylist['pp_commissionable_service'] != 0 ? round($stylist['actual_paycheck']/$stylist['pp_commissionable_service']*100,2) : 0;
                $stylist['percent_product_commission'] = $stylist['pp_product_sales'] != 0 ? round($stylist['product_commission']/$stylist['pp_product_sales']*100,2) : 0;
            }
        else
        {
            $stylist =&$stylists;
            $stylist['pp_hourly_base'] = $stylist['pp_product_hours'] != 0 ? round($stylist['hourly_gross']/$stylist['pp_product_hours'],2) : 0;
            $stylist['product_commission_15'] = round(($stylist['pp_product_sales'] < 250 ? $stylist['pp_product_sales'] : 250)*.15,2);
            $stylist['product_commission_20'] = round(($stylist['pp_product_sales'] > 250 ? ( $stylist['pp_product_sales'] < 500 ? $stylist['pp_product_sales']-250 : 250) : 0)*0.2,2);
            $stylist['product_commission_25'] = round(($stylist['pp_product_sales'] > 500 ? $stylist['pp_product_sales']-500 : 0)*0.25,2);
            $stylist['product_commission'] = round($stylist['product_commission_15']+$stylist['product_commission_20']+$stylist['product_commission_25'],2);
            $stylist['total_earned_service'] = round($stylist['product_commission']+$stylist['service_commission'],2);
            $stylist['actual_paycheck'] = round($stylist['nonproduct_wages']+( $stylist['service_commission'] > $stylist['hourly_gross'] ? $stylist['total_earned_service'] : $stylist['hourly_gross']),2);
            $stylist['pp_service_commission_rate'] = $stylist['pp_commissionable_service'] != 0 ? round($stylist['service_commission'] / $stylist['pp_commissionable_service'],2) : 0;
            
            $stylist['divide_product_hours'] = $stylist['pp_product_hours'];
            $stylist['total_hourly_pay'] = $stylist['pp_product_hours'] != 0 ? round($stylist['actual_paycheck'] / $stylist['pp_product_hours'], 2) : 0;
            $stylist['gross_revenue'] = round($stylist['pp_commissionable_service']+$stylist['pp_product_sales'],2);
            $stylist['percent_product_sales'] = $stylist['gross_revenue'] != 0 ? round($stylist['pp_product_sales']/$stylist['gross_revenue']*100,2) : 0;
            $stylist['percent_service_commission'] = $stylist['pp_commissionable_service'] != 0 ? round($stylist['actual_paycheck']/$stylist['pp_commissionable_service']*100,2) : 0;
            $stylist['percent_product_commission'] = $stylist['pp_product_sales'] != 0 ? round($stylist['product_commission']/$stylist['pp_product_sales']*100,2) : 0;
        }
        
        return $stylists;
    }
}

?>
function safelyDivideTwoNumbers(a,b) {
  if ( b != 0 ) {
    return a / b
  } else {
    return 0;
  }
}

function safelyFindPercentage(a,b) {
  return safelyDivideTwoNumbers(a, b) * 100;
}

function getCappedValue(a, max) {
  if (a > max) {
    return a;
  } else {
    return max;
  }
}

function tier(sales, limit) {
  return sales <= limit ? 0 : sales - limit;
}

function getCommissions(sales) {
  var tiers = [
    getCappedValue(sales, 250),
    getCappedValue(tier(sales,250)),
    getCappedValue(tier(sales, 500)),
  ];

  var rates = [
    0.15,
    0.2,
    0.25,
  ];

  return tiers.map(function(tierAmount, i) {
    return tierAmount * rates[i],
  });
}

function getPreflightCalcs(stylist, productCommission) {
  var totalEarnedService  =  productCommission + stylist.service_commission;
  var actualPaycheck      =  stylist.nonproduct_wages + (stylist.service_commission > stylist.hourly_gross ? totalEarnedService : stylist.hourly_gross),
  var grossRevenue        =  stylist.pp_commissionable_service + stylist.pp_product_sales;

  return {
    productCommission,
    totalEarnedService,
    actualPaycheck,
    grossRevenue,
  };
}

function fillStylist(stylist) {
  var commissions = getCommissions(stylist.pp_product_sales);

  var productCommission = comissions.reduce(function(accumulator, amount) {
    return accumulator + amount;
  }, 0);

  var preflightCalculations = getPreflightCalcs(stylist, productCommission);

  var { totalEarnedService, grossRevenue, actualPaycheck, } = preflightCalculations;

  var newStylist = {
    total_hourly_pay           : safelyDivideTwoNumbers(actualPaycheck             , stylist.pp_product_hours),
    pp_hourly_base             : safelyDivideTwoNumbers(stylist.hourly_gross       , stylist.pp_product_hours),
    pp_service_commission_rate : safelyDivideTwoNumbers(stylist.service_commission , stylist.pp_commissionable_service),
    percent_product_sales      : safelyFindPercentage(stylist.pp_product_sales   , stylist.gross_revenue),
    percent_service_commission : safelyFindPercentage(actualPaycheck             , stylist.pp_commissionable_service),
    percent_product_commission : safelyFindPercentage(stylist.product_commission , stylist.pp_product_sales),
    divide_product_hours       : stylist.pp_product_hours,
  };

  return {
    ...extraMoney,
    ...preflightCalculations,
    ...newStylist,
  };
}

function fillStylists(stylists) {
  return stylists.map(function(stylist) {
    return fillStylist(stylist);
  });
}

function fillWorkSheet(stylists) {
  if (Array.isArray(stylists)) {
    return fillStylists(stylists);
  }
  else {
    return fillStylists([stylists]);
  }
}
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
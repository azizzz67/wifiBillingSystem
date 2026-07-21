import 'package:flutter/material.dart';
import 'package:wifi_billing/routes/app_router.dart';
import 'package:wifi_billing/routes/app_routes.dart';

class WifiKuApp extends StatelessWidget {
  const WifiKuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WiFiKu',
      debugShowCheckedModeBanner: false,
      initialRoute: AppRoutes.splash,
      onGenerateRoute: AppRouter.onGenerateRoute,
    );
  }
}

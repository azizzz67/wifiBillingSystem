import 'package:flutter/material.dart';
import 'package:wifi_billing/routes/app_routes.dart';
import 'package:wifi_billing/screens/auth/login_page.dart';
import 'package:wifi_billing/screens/billing/billing_page.dart';
import 'package:wifi_billing/screens/complaint/complaint_page.dart';
import 'package:wifi_billing/screens/dashboard/dashboard_page.dart';
import 'package:wifi_billing/screens/history/history_page.dart';
import 'package:wifi_billing/screens/package/package_page.dart';
import 'package:wifi_billing/screens/payment/payment_page.dart';
import 'package:wifi_billing/screens/profile/profile_page.dart';
import 'package:wifi_billing/screens/splash/splash_page.dart';

abstract final class AppRouter {
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final page = switch (settings.name) {
      AppRoutes.splash => const SplashPage(),
      AppRoutes.login => const LoginPage(),
      AppRoutes.dashboard => const DashboardPage(),
      AppRoutes.billing => const BillingPage(),
      AppRoutes.payment => const PaymentPage(),
      AppRoutes.history => const HistoryPage(),
      AppRoutes.internetPackage => const PackagePage(),
      AppRoutes.complaint => const ComplaintPage(),
      AppRoutes.profile => const ProfilePage(),
      _ => null,
    };

    if (page == null) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (_) => const _UnknownRoutePage(),
      );
    }

    return MaterialPageRoute<void>(settings: settings, builder: (_) => page);
  }
}

class _UnknownRoutePage extends StatelessWidget {
  const _UnknownRoutePage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Halaman tidak ditemukan')));
  }
}

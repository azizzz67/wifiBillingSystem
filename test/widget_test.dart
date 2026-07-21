import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wifi_billing/app.dart';
import 'package:wifi_billing/routes/app_router.dart';
import 'package:wifi_billing/routes/app_routes.dart';

void main() {
  testWidgets('aplikasi dimulai dari splash screen', (tester) async {
    await tester.pumpWidget(const WifiKuApp());

    expect(find.text('WiFiKu'), findsOneWidget);
  });

  testWidgets('seluruh named route dapat dibuka', (tester) async {
    for (final routeName in AppRoutes.all) {
      await tester.pumpWidget(
        MaterialApp(
          initialRoute: routeName,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Halaman tidak ditemukan'), findsNothing);
    }
  });
}

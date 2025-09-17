const routes = require('./src/configs/routes.config/routes.config.ts');

// Test that some key routes exist
const testRoutes = [
  '/admin/analytics',
  '/admin/analytics/revenue', 
  '/admin/leases',
  '/admin/refills',
  '/staff/refills',
  '/operator/refills'
];

console.log('Testing route definitions:');
testRoutes.forEach(route => {
  const exists = routes.protectedRoutes[route] !== undefined;
  console.log(`  ${route}: ${exists ? '✓' : '✗'}`);
});

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, User, Shield, Store } from 'lucide-react';

export default function LoginHelper() {
  const accounts = [
    {
      role: 'Admin',
      email: 'admin@buildmart.ai',
      password: 'admin123',
      description: 'Full system access',
      icon: Shield,
      color: 'bg-red-100 text-red-700'
    },
    {
      role: 'Manager',
      email: 'manager@buildmart.ai',
      password: 'manager123',
      description: 'Vendor management',
      icon: User,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      role: 'Vendor',
      email: 'vendor1@buildmart.ai',
      password: 'vendor123',
      description: 'Product management',
      icon: Store,
      color: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Demo Login Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => {
          const IconComponent = account.icon;
          return (
            <div key={account.email} className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">{account.role}</span>
                <Badge variant="outline" className={account.color}>
                  {account.description}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-600">Email: </span>
                  <code className="bg-gray-100 px-1 rounded">{account.email}</code>
                </div>
                <div>
                  <span className="text-gray-600">Password: </span>
                  <code className="bg-gray-100 px-1 rounded">{account.password}</code>
                </div>
              </div>
            </div>
          );
        })}
        <div className="text-xs text-gray-500 mt-4">
          💡 Copy and paste these credentials to test different user roles
        </div>
      </CardContent>
    </Card>
  );
}
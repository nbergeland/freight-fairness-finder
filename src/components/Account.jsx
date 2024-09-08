import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Account = () => {
  // Mock user data
  const user = {
    email: 'user@example.com',
    plan: 'Basic',
    searchesRemaining: 50,
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Current Plan:</strong> {user.plan}</p>
        <p><strong>Searches Remaining:</strong> {user.searchesRemaining}</p>
        <Button className="mt-4">Upgrade Plan</Button>
      </CardContent>
    </Card>
  );
};
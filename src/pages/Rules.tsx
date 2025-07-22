import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Rules = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tmis-light to-white px-4 py-10">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-tmis-primary">Boarding House Rules and Regulations</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Home</span>
              </Link>
            </Button>
          </div>
          <CardDescription>
            Please read and understand the following rules before registering.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3">1. General Conduct</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Respect the rights and properties of other tenants at all times.</li>
              <li>Maintain a reasonable noise level at all times. Quiet hours are from 10:00 PM to 6:00 AM.</li>
              <li>No smoking inside the boarding house premises.</li>
              <li>No consumption of alcoholic beverages in common areas.</li>
              <li>No illegal activities or substances permitted on the premises.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">2. Rent and Payments</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Rent is due on the 1st day of each month.</li>
              <li>A late fee of ₱500 will be charged for payments received after the 5th of the month.</li>
              <li>Security deposit equal to one month's rent is required upon move-in.</li>
              <li>Accepted payment methods: Bank transfer, GCash, or cash directly to the administration office.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">3. Room Maintenance</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Keep your room clean and in good condition at all times.</li>
              <li>Report any maintenance issues promptly through the maintenance request system.</li>
              <li>No alterations or modifications to the room without prior written permission.</li>
              <li>Room inspections will be conducted monthly with prior notice.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">4. Visitors</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Visitors are allowed from 8:00 AM to 9:00 PM.</li>
              <li>All visitors must register at the front desk.</li>
              <li>Overnight guests are not permitted without prior approval.</li>
              <li>Tenants are responsible for the conduct of their visitors.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">5. Common Areas</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Keep common areas clean and tidy after use.</li>
              <li>Laundry facilities are available from 7:00 AM to 9:00 PM.</li>
              <li>Personal items should not be left in common areas.</li>
              <li>Use kitchen facilities responsibly and clean up after use.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">6. Security</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>The main entrance gate closes at 10:00 PM. Tenants returning after this time must use their access card.</li>
              <li>Do not share your access card or room keys with others.</li>
              <li>Report any suspicious activities or persons to management immediately.</li>
              <li>The boarding house is not responsible for lost or stolen personal belongings.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3">7. Moving Out</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Provide at least 30 days written notice before moving out.</li>
              <li>Room must be returned in the same condition as when it was occupied.</li>
              <li>Security deposit will be returned within 14 days after move-out, less any charges for damages or outstanding balances.</li>
            </ul>
          </section>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Proceed to Registration</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rules;
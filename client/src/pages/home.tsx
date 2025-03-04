import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Sheet } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: sheets, isLoading } = useQuery<Sheet[]>({ 
    queryKey: ["/api/sheets"]
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!sheets?.length) {
    return (
      <Card className="text-center p-6">
        <p className="text-muted-foreground mb-4">No tests available yet</p>
        <Link href="/create">
          <Button>Create Your First Test</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sheets.map((sheet) => (
        <Card key={sheet.id}>
          <CardHeader>
            <CardTitle>{sheet.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{sheet.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{sheet.timeLimit} minutes</span>
              </div>
              <Link href={`/test/${sheet.id}`}>
                <Button>
                  Take Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

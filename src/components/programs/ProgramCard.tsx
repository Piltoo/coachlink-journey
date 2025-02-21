
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProgramCardProps = {
  program: {
    id: string;
    title: string;
    description: string;
    created_at: string;
  };
};

export const ProgramCard = ({ program }: ProgramCardProps) => {
  return (
    <Card key={program.id}>
      <CardHeader>
        <CardTitle>{program.title}</CardTitle>
        <CardDescription>
          {new Date(program.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{program.description}</p>
      </CardContent>
    </Card>
  );
};

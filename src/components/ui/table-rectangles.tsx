import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { type Rectangle, Instance } from "@/models/binpacking";

export const TableRectangles = ({
  isScrollable,
  instance,
}: {
  isScrollable: boolean;
  instance: Instance;
}) => {
  return (
    <div
      className={`mt-2 relative w-70 rounded-md border ${isScrollable ? "h-34 overflow-y-auto" : ""}`}
    >
      <Table>
        <TableHeader>
          <TableRow className="h-6 py-0">
            <TableHead className="w-0.5">Id</TableHead>
            <TableHead className="w-2.5">Width</TableHead>
            <TableHead className="w-2.5">Height</TableHead>
            <TableHead className="w-0.5">Is rotated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instance.rectangles.map((rect: Rectangle) => (
            <TableRow key={rect.id} className="h-8">
              <TableCell className="font-medium w-0.5 py-1">
                {rect.id}
              </TableCell>
              <TableCell className="w-2.5 py-1">{rect.getWidth}</TableCell>
              <TableCell className="w-2.5 py-1">{rect.getHeight}</TableCell>
              <TableCell className="w-0.5 py-1">
                {rect.rotated ? "yes" : "no"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>


    </div>
  );
};

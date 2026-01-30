import { useContext } from "react";

import {
    Table,
    TableHeader,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { type Rectangle, Instance } from "@/models/binpacking";
import { MainContext } from "@/context/MainContext";

export function CurrentInstance() {
    const { instance } = useContext(MainContext) ?? { instance: null };

    const isScrollable: boolean = !instance
        ? false
        : instance.rectangles.length > 3;

    return (
        <div className="grid w-full gap-2 text-left">
            <div className="text-xl font-bold text-gray-800">
                2. Current Instance
            </div>
            {!instance ? (
                <div>No instance currently (￣﹃￣)</div>
            ) : (
                <div className="w-full">
                    <div className="text-sm">
                        <div>Box length L = {instance.L}</div>
                        <div>
                            Number of rectangles N ={" "}
                            {instance.rectangles.length}
                        </div>
                    </div>

                    <TableRectangles
                        isScrollable={isScrollable}
                        instance={instance}
                    />
                </div>
            )}
        </div>
    );
}

const TableRectangles = ({
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
                        <TableHead className="w-0.5">Rotated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {instance.rectangles.map((rect: Rectangle) => (
                        <TableRow key={rect.id} className="h-8">
                            <TableCell className="font-medium w-0.5 py-1">
                                {rect.id}
                            </TableCell>
                            <TableCell className="w-2.5 py-1">
                                {rect.getWidth}
                            </TableCell>
                            <TableCell className="w-2.5 py-1">
                                {rect.getHeight}
                            </TableCell>
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

export default CurrentInstance;

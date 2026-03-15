import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";
import {ToastProvider} from "@/context/toast-context";
import {ConfirmationProvider} from "@/context/confirmation-context";

export default function BaseLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <ConfirmationProvider>
                <DragWindowRegion title="TubeSnag"/>
                <main className="h-screen">{children}</main>
            </ConfirmationProvider>
        </ToastProvider>
    );
}

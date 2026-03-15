import {createContext, useContext, useState, useCallback} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {AlertTriangle, CheckCircle2, Info, XCircle} from "lucide-react";
import {cn} from "@/lib/utils/tailwind";

type ConfirmationType = "danger" | "warning" | "info" | "success";

interface ConfirmationOptions {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmationType;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmClassname?: string
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

const typeConfig = {
    danger: {
        icon: XCircle,
        iconClass: "text-rose-500",
    },
    warning: {
        icon: AlertTriangle,
        iconClass: "text-amber-500",
    },
    info: {
        icon: Info,
        iconClass: "text-blue-500",
    },
    success: {
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
    },
};

export function ConfirmationProvider({children}: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmationOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
        setOptions(opts);
        setOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        options?.onConfirm?.();
        resolvePromise?.(true);
        setOpen(false);
        setOptions(null);
        setResolvePromise(null);
    };

    const handleCancel = () => {
        options?.onCancel?.();
        resolvePromise?.(false);
        setOpen(false);
        setOptions(null);
        setResolvePromise(null);
    };

    const type = options?.type || "warning";
    const {icon: Icon, iconClass} = typeConfig[type];

    return (
        <ConfirmationContext.Provider value={{confirm}}>
            {children}
            {options && (
                <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
                    <DialogContent className="sm:max-w-[440px]">
                        <div className="flex gap-4 items-start pt-2">
                            <Icon className={cn("size-6 shrink-0 mt-0.5", iconClass)} strokeWidth={2}/>
                            <div className="flex-1 space-y-3">
                                <DialogHeader className="space-y-2 text-left p-0">
                                    <DialogTitle className="text-base font-semibold">
                                        {options.title}
                                    </DialogTitle>
                                    {options.description && (
                                        <DialogDescription className="text-sm leading-relaxed">
                                            {options.description}
                                        </DialogDescription>
                                    )}
                                </DialogHeader>
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="min-w-[100px] text-sm p-4"
                            >
                                {options.cancelText || "Cancel"}
                            </Button>
                            <Button
                                variant={type === "danger" ? "destructive" : "default"}
                                onClick={handleConfirm}
                                className={cn("min-w-[100px] p-4 text-sm", options.confirmClassname)}
                            >
                                {options.confirmText || "OK"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </ConfirmationContext.Provider>
    );
}

export function useConfirmation() {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error("useConfirmation must be used within a ConfirmationProvider");
    }
    return context;
}

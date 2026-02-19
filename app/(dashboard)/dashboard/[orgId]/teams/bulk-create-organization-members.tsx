"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, List, Eye } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Stepper, Step } from "@/components/ui/stepper";
import Table, { TableColumn } from "@/components/ui/data-table";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { useBulkInvite } from "@/services/organization.services";
import { BulkInviteMember } from "@/interfaces/organizations.interfaces";
import { toast } from "sonner";

// Validation schema for CSV upload
const BulkUploadSchema = Yup.object().shape({
    file: Yup.mixed().required("CSV file is required"),
});

const REQUIRED_COLUMNS = ["email", "role", "start_date", "pay_rate"];
const OPTIONAL_COLUMNS = ["birthday"];

const STEPS: Step[] = [
    { title: "Upload", value: "upload", icon: Upload },
    { title: "Confirm", value: "confirm", icon: Eye },
];

export function BulkAddOrganizationMember() {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState("upload");
    const [parsedMembers, setParsedMembers] = useState<BulkInviteMember[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeOrgId } = useWorkspace();
    const { mutateAsync: bulkInvite } = useBulkInvite();

    const formik = useFormik({
        initialValues: {
            file: null as File | null,
        },
        validationSchema: BulkUploadSchema,
        validateOnMount: false,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            if (currentStep === "upload") {
                if (!values.file) return;

                try {
                    const reader = new FileReader();

                    const fileContent = await new Promise<string>((resolve, reject) => {
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.onerror = (e) => reject(new Error("Failed to read file"));
                        reader.readAsText(values.file!);
                    });

                    const lines = fileContent.split(/\r?\n/);
                    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

                    const members: BulkInviteMember[] = lines.slice(1)
                        .filter(line => line.trim().length > 0)
                        .map(line => {
                            const cells = line.split(",").map(v => v.trim());
                            const member: any = { projects: [] };

                            headers.forEach((header, index) => {
                                const val = cells[index];
                                if (!val) return;

                                if (header === "email") member.email = val;
                                if (header === "role") member.role = val.toLowerCase() as 'manager' | 'member';
                                if (header === "birthday") member.birthday = new Date(val).toISOString();
                                if (header === "start_date") member.startDate = new Date(val).toISOString();
                            });

                            return member as BulkInviteMember;
                        })
                        .filter(m => m.email && m.role);

                    if (members.length === 0) {
                        toast.error("No valid members found in CSV");
                        return;
                    }

                    setParsedMembers(members);
                    setCurrentStep("confirm");
                } catch (error) {
                    console.error("Failed to parse CSV:", error);
                    toast.error("Failed to parse CSV file");
                } finally {
                    setSubmitting(false);
                }
                return;
            }

            // If in preview step, actually submit
            if (!activeOrgId) return;

            try {
                await bulkInvite({
                    organizationId: activeOrgId,
                    members: parsedMembers
                });

                toast.success(`${parsedMembers.length} invitations sent successfully`);
                setOpen(false);
                resetForm();
                setSelectedFile(null);
                setCurrentStep("upload");
                setParsedMembers([]);
            } catch (error: any) {
                console.error("Failed to upload CSV:", error);
                toast.error(error?.response?.data?.message || "Failed to process bulk upload");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            formik.resetForm();
            setSelectedFile(null);
            setCurrentStep("upload");
            setParsedMembers([]);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
            setSelectedFile(file);
            formik.setFieldValue("file", file);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    }, []);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileChange(file);
    };

    const handleDownloadTemplate = () => {
        const headers = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(",");
        const exampleRow = "john.doe@example.com,member,2024-01-15,50,1990-05-20";
        const csvContent = `${headers}\n${exampleRow}`;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "team_members_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const columns: TableColumn<BulkInviteMember>[] = [
        {
            header: "Email",
            key: "email",
            render: (value) => <span className="font-medium text-sm">{value as string}</span>,
        },
        {
            header: "Role",
            key: "role",
            render: (value) => <Badge variant="secondary" className="capitalize">{value as string}</Badge>,
        },
        {
            header: "Start Date",
            key: "startDate",
            render: (value) => <span className="text-sm">{value ? new Date(value as string).toLocaleDateString() : 'N/A'}</span>,
        },
        {
            header: "Birthday",
            key: "birthday",
            render: (value) => <span className="text-sm">{value ? new Date(value as string).toLocaleDateString() : 'N/A'}</span>,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2" variant="outline">
                    <Upload className="h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Team Members</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add multiple team members at once.
                    </DialogDescription>
                </DialogHeader>

                {/* <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" /> */}

                <form onSubmit={formik.handleSubmit} className="contents">
                    <div className="py-4">
                        {currentStep === "upload" ? (
                            <div className="space-y-6">
                                {/* CSV Template Section */}
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">CSV Template</p>
                                            <p className="text-sm text-muted-foreground">
                                                Download our template with the correct column headers
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDownloadTemplate}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>

                                {/* File Upload Zone */}
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />

                                    <div className="flex flex-col items-center gap-4">
                                        <Upload className="h-12 w-12 text-muted-foreground" />

                                        {selectedFile ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        formik.setFieldValue("file", null);
                                                    }}
                                                >
                                                    Remove file
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <p className="text-base font-medium mb-1">
                                                        Drop your CSV file here
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        or click to browse
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    Choose File
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Column Requirements */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium mb-2">Required columns:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {REQUIRED_COLUMNS.map((col) => (
                                                <Badge
                                                    key={col}
                                                    variant="secondary"
                                                    className="font-mono text-xs"
                                                >
                                                    {col}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium mb-2">Optional columns:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {OPTIONAL_COLUMNS.map((col) => (
                                                <Badge
                                                    key={col}
                                                    variant="outline"
                                                    className="font-mono text-xs"
                                                >
                                                    {col}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Review the members found in your CSV file before sending invitations.
                                </p>
                                <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                                    <Table
                                        data={parsedMembers}
                                        columns={columns}
                                        compact
                                        bordered={false}
                                        className="border-0"
                                        headerClassName="bg-muted/50 text-xs font-semibold uppercase tracking-wider h-10"
                                    />
                                </div>
                                <p className="text-sm font-medium">
                                    Total: {parsedMembers.length} member{parsedMembers.length !== 1 ? 's' : ''} to be invited
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        {currentStep === "confirm" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCurrentStep("upload")}
                                disabled={formik.isSubmitting}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={formik.isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={formik.isSubmitting || (currentStep === "upload" && !selectedFile)}
                        >
                            {currentStep === "upload"
                                ? "Next"
                                : (formik.isSubmitting ? "Inviting..." : "Send Invitations")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

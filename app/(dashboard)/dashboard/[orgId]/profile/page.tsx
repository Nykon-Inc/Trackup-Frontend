"use client"

import { ChangeEvent, useMemo, useRef, useState } from "react"
import { useFormik } from "formik"
import { useParams } from "next/navigation"
import { Camera, KeyRound, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    useChangeMyPassword,
    useDeleteMyProfileImage,
    useSaveOrEditMyProfileImage,
    useUpdateMyProfile,
    useUpdateMyTwoFactor,
} from "@/services/users"
import { useAuthStore } from "@/stores/auth.store"
import { changePasswordSchema } from "@/validators/auth"

const DEFAULT_TIMEZONE = "(GMT+01:00) Africa/Lagos"
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
])

const splitName = (name?: string) => {
    if (!name) return { firstName: "", lastName: "" }

    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 1) return { firstName: parts[0], lastName: "" }

    return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
    }
}

const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

const getFileExt = (file: File) => {
    const byName = file.name.split(".").pop()?.toLowerCase()
    if (byName) return byName
    return file.type.split("/").pop()?.toLowerCase() || "png"
}

export default function ProfilePage() {
    const params = useParams()
    const { account, setAccount } = useAuthStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const saveOrEditProfileImageMutation = useSaveOrEditMyProfileImage()
    const deleteProfileImageMutation = useDeleteMyProfileImage()
    const updateMyProfileMutation = useUpdateMyProfile()
    const updateTwoFactorMutation = useUpdateMyTwoFactor()
    const changeMyPasswordMutation = useChangeMyPassword()

    const baseForm = useMemo(() => {
        const parsedName = splitName(account?.name);

        return {
            firstName: parsedName.firstName,
            lastName: parsedName.lastName,
            email: account?.email || "",
            timeZone: DEFAULT_TIMEZONE,
            phone: account?.phoneNumber || "",
            skype: "",
        }
    }, [account?.name, account?.email, account?.phoneNumber])

    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeletePictureOpen, setIsDeletePictureOpen] = useState(false)
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [form, setForm] = useState(baseForm)

    const changePasswordFormik = useFormik({
        initialValues: {
            currentPassword: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: changePasswordSchema,
        onSubmit: async (values, helpers) => {
            if (values.currentPassword === values.password) {
                helpers.setFieldError("password", "New password must be different from current password")
                return
            }

            try {
                await changeMyPasswordMutation.mutateAsync({
                    currentPassword: values.currentPassword,
                    password: values.password,
                })
                toast.success("Password changed successfully")
                handleCloseChangePassword()
            } catch (error: any) {
                const message = error?.response?.data?.message || "Failed to change password"
                toast.error(message)
            }
        },
    })

    const twoFactorEnabled = Boolean(account?.twoFactorEnabled)

    const handleFieldChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleStartEdit = () => {
        setForm(baseForm)
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setForm(baseForm)
        setIsEditing(false)
    }

    const handleSave = async () => {
        if (!form.email.includes("@")) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSaving(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        const fullName = [form.firstName, form.lastName].join(" ").trim() || account?.name || "User"

        try {
            const response = await updateMyProfileMutation.mutateAsync({
                name: fullName,
                phoneNumber: form.phone,
            })

            if (response?.account && account) {
                setAccount({ ...account, ...response.account })
            }

            setIsSaving(false)
            setIsEditing(false)
            toast.success("Profile updated")
        } catch {
            setIsSaving(false)
            toast.error("Failed to update profile")
        }
    }

    const handleChangePictureClick = () => {
        fileInputRef.current?.click()
    }

    const handleProfileImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type.toLowerCase())) {
            toast.error("Only png, jpg, jpeg, or webp images are allowed")
            event.target.value = ""
            return
        }

        if (file.size > MAX_PROFILE_IMAGE_BYTES) {
            toast.error("Profile image must be 2MB or less")
            event.target.value = ""
            return
        }

        try {
            const image = await fileToBase64(file)
            const response = await saveOrEditProfileImageMutation.mutateAsync({
                image,
                fileExt: getFileExt(file),
            })

            if (response?.account && account) {
                setAccount({ ...account, ...response.account })
            }

            toast.success("Profile picture updated")
        } catch {
            toast.error("Failed to update profile picture")
        } finally {
            event.target.value = ""
        }
    }

    const handleConfirmDeletePicture = async () => {
        try {
            const response = await deleteProfileImageMutation.mutateAsync()
            if (response?.account && account) {
                setAccount({ ...account, ...response.account })
            }
            toast.success("Profile picture deleted")
            setIsDeletePictureOpen(false)
        } catch {
            toast.error("Failed to delete profile picture")
        }
    }

    const handleConfirmDeleteAccount = () => {
        setIsDeleteAccountOpen(false)
        toast.error("Account deletion is disabled in this preview")
    }

    const resetPasswordForm = () => {
        changePasswordFormik.resetForm()
    }

    const handleOpenChangePassword = () => {
        resetPasswordForm()
        setIsChangePasswordOpen(true)
    }

    const handleCloseChangePassword = () => {
        setIsChangePasswordOpen(false)
        resetPasswordForm()
    }

    const handleToggleTwoFactor = async (enabled: boolean) => {
        if (enabled === twoFactorEnabled) return

        try {
            const response = await updateTwoFactorMutation.mutateAsync({ enabled })
            if (response?.account && account) {
                setAccount({ ...account, ...response.account })
            }
            toast.success(`Two-factor authentication ${enabled ? "enabled" : "disabled"}`)
        } catch {
            toast.error("Failed to update two-factor authentication")
        }
    }

    const initials = account?.name?.slice(0, 2)?.toUpperCase() || "CN"
    const status = account?.status || "unknown"
    const accountType = account?.accountType || "-"
    const role = account?.role || "-"
    const verificationText = account?.isVerified ? "Verified" : "Not verified"

    return (
        <div className="flex h-full w-full flex-col">
            <PageHeader
                title="Profile"
                breadcrumbs={[
                    { label: "Dashboard", href: `/dashboard/${params?.orgId}`, active: false },
                    { label: "Profile", href: `/dashboard/${params?.orgId}/profile`, active: true }
                ]}
            />

            <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
                    <Card className="gap-0 py-0">
                        <CardContent className="px-5 py-6">
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-36 w-36 border border-border">
                                    <AvatarImage src={account?.avatar || undefined} alt={account?.name || "User"} />
                                    <AvatarFallback className="bg-primary/15 text-3xl font-semibold text-primary">{initials}</AvatarFallback>
                                </Avatar>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handleProfileImageSelected}
                                />

                                <Button
                                    variant="ghost"
                                    className="text-primary"
                                    loading={saveOrEditProfileImageMutation.isPending}
                                    onClick={handleChangePictureClick}
                                >
                                    <Camera className="h-4 w-4" />
                                    Change picture
                                </Button>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setIsDeletePictureOpen(true)}
                                    disabled={!account?.avatar}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete picture
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={handleOpenChangePassword}>
                                    <KeyRound className="h-4 w-4" />
                                    Change password
                                </Button>
                                <Button variant="destructive" className="w-full justify-start" onClick={() => setIsDeleteAccountOpen(true)}>
                                    <Trash2 className="h-4 w-4" />
                                    Delete account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Account info</CardTitle>
                                <CardDescription>These fields come from your account record and are not editable here.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                                    <p className="text-sm font-medium">{role}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                                    <Badge variant={status === "active" ? "approved" : status === "disabled" ? "rejected" : "outline"}>
                                        <span className="mr-1">{status === "active" ? "●" : status === "disabled" ? "●" : "-"}</span>
                                        {status}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Account type</p>
                                    <Badge variant="outline" className="capitalize">{accountType}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Verification</p>
                                    <Badge variant={account?.isVerified ? "approved" : "outline"}>{verificationText}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="gap-4">
                            <CardHeader>
                                <CardTitle className="text-2xl">Account Details</CardTitle>
                                <CardDescription>View and manage your personal profile details.</CardDescription>
                                <CardAction>
                                    {!isEditing ? (
                                        <Button variant="outline" onClick={handleStartEdit}>
                                            Edit profile
                                        </Button>
                                    ) : (
                                        <p className="text-sm">Editing</p>
                                    )}
                                </CardAction>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First name</Label>
                                        <Input
                                            id="first-name"
                                            placeholder="First name"
                                            value={isEditing ? form.firstName : baseForm.firstName}
                                            onChange={(event) => handleFieldChange("firstName", event.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last name</Label>
                                        <Input
                                            id="last-name"
                                            placeholder="Last name"
                                            value={isEditing ? form.lastName : baseForm.lastName}
                                            onChange={(event) => handleFieldChange("lastName", event.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={isEditing ? form.email : baseForm.email}
                                            onChange={(event) => handleFieldChange("email", event.target.value)}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Time zone</Label>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                                        <Input
                                            id="timezone"
                                            value={form.timeZone}
                                            onChange={(event) => handleFieldChange("timeZone", event.target.value)}
                                            disabled={!isEditing}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => handleFieldChange("timeZone", DEFAULT_TIMEZONE)}
                                            disabled={!isEditing}
                                        >
                                            Detect
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="(201) 555-5555"
                                        value={form.phone}
                                        onChange={(event) => handleFieldChange("phone", event.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                                        <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} loading={isSaving}>
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Manage Two-Factor Authentication</CardTitle>
                                <CardDescription className="max-w-3xl text-base text-foreground">
                                    Two-factor authentication is an extra layer of security that requires you to enter a code from your phone when logging into your account from an untrusted device.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="inline-flex rounded-full bg-muted p-1">
                                    <button
                                        type="button"
                                        disabled={updateTwoFactorMutation.isPending}
                                        className={`min-w-20 rounded-full px-4 py-2 text-sm transition ${twoFactorEnabled ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                        onClick={() => handleToggleTwoFactor(true)}
                                    >
                                        On
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updateTwoFactorMutation.isPending}
                                        className={`min-w-20 rounded-full px-4 py-2 text-sm transition ${!twoFactorEnabled ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                                        onClick={() => handleToggleTwoFactor(false)}
                                    >
                                        Off
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    2FA is currently {twoFactorEnabled ? "enabled" : "disabled"}.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isDeletePictureOpen} onOpenChange={setIsDeletePictureOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete picture?</DialogTitle>
                        <DialogDescription>
                            This will remove your current profile picture and revert to initials.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeletePictureOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            loading={deleteProfileImageMutation.isPending}
                            onClick={handleConfirmDeletePicture}
                        >
                            Delete picture
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete account?</DialogTitle>
                        <DialogDescription>
                            This action is permanent and can remove your access and related data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDeleteAccount}>
                            Delete account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isChangePasswordOpen} onOpenChange={(open) => (open ? setIsChangePasswordOpen(true) : handleCloseChangePassword())}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={changePasswordFormik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current password</Label>
                            <Input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                placeholder="Current password"
                                value={changePasswordFormik.values.currentPassword}
                                onChange={changePasswordFormik.handleChange}
                                onBlur={changePasswordFormik.handleBlur}
                                disabled={changeMyPasswordMutation.isPending}
                            />
                            {changePasswordFormik.touched.currentPassword && changePasswordFormik.errors.currentPassword && (
                                <p className="text-xs font-medium text-destructive">{changePasswordFormik.errors.currentPassword}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New password</Label>
                            <Input
                                id="new-password"
                                name="password"
                                type="password"
                                placeholder="New password"
                                value={changePasswordFormik.values.password}
                                onChange={changePasswordFormik.handleChange}
                                onBlur={changePasswordFormik.handleBlur}
                                disabled={changeMyPasswordMutation.isPending}
                            />
                            {changePasswordFormik.touched.password && changePasswordFormik.errors.password && (
                                <p className="text-xs font-medium text-destructive">{changePasswordFormik.errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-new-password">Confirm new password</Label>
                            <Input
                                id="confirm-new-password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={changePasswordFormik.values.confirmPassword}
                                onChange={changePasswordFormik.handleChange}
                                onBlur={changePasswordFormik.handleBlur}
                                disabled={changeMyPasswordMutation.isPending}
                            />
                            {changePasswordFormik.touched.confirmPassword && changePasswordFormik.errors.confirmPassword && (
                                <p className="text-xs font-medium text-destructive">{changePasswordFormik.errors.confirmPassword}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseChangePassword} disabled={changeMyPasswordMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={changeMyPasswordMutation.isPending}>
                                Update password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

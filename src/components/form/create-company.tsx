"use client";

import { useForm } from "@tanstack/react-form";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { companyRegistrationSchema } from "@/validation";


import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { useCompanyRegistration } from "@/hook";
import z from "zod";

export function CompanyRegisterForm() {
    const router = useRouter();

    type CompanyDefaultValues = z.infer<typeof companyRegistrationSchema>;

    const defaultValues: CompanyDefaultValues = {
        name: "",
        email: "",
        description: "",
        website: "",
    };

    const { mutate: registration, isPending: registrationPending } =
        useCompanyRegistration();

    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: companyRegistrationSchema,
        },
        onSubmit: async ({ value }) => {
            const registrationData = {
                name: value.name,
                email: value.email,
                description: value.description,
                website: value.website,
            };

            registration(registrationData, {
                onSuccess: (res) => {
                    if (!res.success) {
                        toast.add({
                            title: "Server Failure",
                            description: "Something went wrong. Please try again",
                            type: "error",
                        });
                    }

                    toast.add({
                        title: "Registration Successful",
                        description: "Please verify your account",
                        type: "success",
                    });
                    const params = new URLSearchParams({ email: registrationData.email });
                    router.push(`/company-registration/verify-company?${params.toString()}`); 
                },
                onError: (err) => {
                    toast.add({
                        title: "Authorization failure",
                        description:
                            err.message || "Something went wrong. Please try again",
                        type: "error",
                    });
                },
            });
        },
    });

    return (
        <div className="flex flex-col gap-6 border p-6 m-2 rounded-md w-[380px] mx-auto">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your details below to create your account
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <form.Field name="name">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            placeholder="Company Name"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            autoComplete="name"
                                        />
                                    </div>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="email">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="email"
                                            placeholder="m@example.com"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="website">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Company Website</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text" 
                                            placeholder="https://example.com"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>
                    <form.Field name="description">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Company Description</FieldLabel>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            placeholder="Description about your company"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            );
                        }}
                    </form.Field>


                    <Button disabled={registrationPending} type="submit">
                        {registrationPending ? (
                            <>
                                <Spinner /> submitting
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}

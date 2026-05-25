"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

import axios from "axios"
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server avatar is required."
    })
});

export const InitialModal = () => {
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/servers", values);

            form.reset();
            router.refresh();
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    };

    if (!isMounted) return null;

    return (
        <Dialog open>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">Create Your Server!</DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Realise your server with a name and an avatar. <br /> You can always change it later
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-8 px-6">
                        
                        {/* Server Avatar upload field */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <Field className="w-full flex flex-col items-center justify-center">
                                <Controller
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FileUpload
                                            endpoint="serverImage"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {form.formState.errors.imageUrl && (
                                    <p className="text-[0.8rem] font-medium text-destructive mt-2">
                                        {form.formState.errors.imageUrl.message}
                                    </p>
                                )}
                            </Field>
                        </div>

                        {/* Server Name Field */}
                        <Field>
                            <FieldLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                Server Name
                            </FieldLabel>
                            
                            <div className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 rounded-lg">
                            <Input 
                                disabled={isLoading}
                                placeholder="Enter server name"
                                {...form.register("name")}
                            />
                            </div>
                            
                            {form.formState.errors.name && (
                                <p className="text-[0.8rem] font-medium text-destructive mt-2">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </Field>
                        
                    </div>
                    
                    <DialogFooter className="px-6 py-4">
                        <Button variant="primary" disabled={isLoading}>Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
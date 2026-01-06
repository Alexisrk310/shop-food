'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/lib/validations/auth';

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { addToast } = useToast();

	// React Hook Form
	const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		}
	});

	useEffect(() => {
		if (user) {
			router.replace('/');
		}

		const message = searchParams.get('message');
		if (message) {
			addToast(message, 'success');
			// Clean URL
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete('message');
			window.history.replaceState({}, '', newUrl.toString());
		}
	}, [user, router, searchParams, addToast]);


	const onSubmit = async (data: LoginValues) => {
		setLoading(true);
		setSubmitError(null);

		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			if (error.message === 'Invalid login credentials') {
				setSubmitError("Credenciales inválidas");
			} else if (error.message === 'Email not confirmed') {
				setSubmitError("Correo electrónico no confirmado");
			} else {
				setSubmitError(error.message);
			}
			setLoading(false);
		} else {
			// Force hard redirect to ensure state update
			// Soft redirect with refresh to update server components
			router.refresh();
			router.push('/');
		}
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
			{/* Ambient Background */}
			<div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

			<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
				<div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
								<svg
									className="w-7 h-7 text-primary-foreground"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
								Foodies
							</h1>
						</div>

						<div className="space-y-4">
							<h2 className="text-4xl font-bold leading-tight tracking-tight text-balance">
								Sabor Auténtico, <br /> Entregado Rápido
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Las mejores hamburguesas, perros y picadas de Cartagena. Ingredientes frescos y el toque secreto de la casa.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-8">
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
								<h3 className="font-semibold text-primary">Sazón Único</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Recetas tradicionales con un toque moderno y delicioso.
								</p>
							</div>
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
								<h3 className="font-semibold text-primary">Entrega Veloz</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Tu comida llega caliente y lista para disfrutar.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-center lg:justify-end">
					<Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
						<CardHeader className="space-y-2 pb-6">
							<div className="flex lg:hidden items-center gap-2 mb-4 justify-center">
								<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
									<svg
										className="w-6 h-6 text-primary-foreground"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<span className="text-xl font-bold text-primary">Foodies</span>
							</div>

							<CardTitle className="text-2xl font-bold tracking-tight">
								Iniciar Sesión
							</CardTitle>
							<CardDescription className="text-base">
								Bienvenido de nuevo
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
								{submitError && (
									<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
										{submitError}
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium">
										Correo Electrónico
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="nombre@ejemplo.com"
										className="h-11 bg-background/50"
										disabled={loading}
										{...register("email")}
									/>
									{errors.email && (
										<p className="text-xs text-destructive font-medium">{errors.email.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="password" className="text-sm font-medium">
											Contraseña
										</Label>
									</div>
									<Input
										id="password"
										type="password"
										placeholder="********"
										className="h-11 bg-background/50"
										disabled={loading}
										{...register("password")}
									/>
									{errors.password && (
										<p className="text-xs text-destructive font-medium">{errors.password.message}</p>
									)}
								</div>

								<Button
									type="submit"
									className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
									disabled={loading}>
									{loading ? "Cargando..." : "Iniciar Sesión"}
								</Button>
							</form>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4 pt-6 border-t border-border/50">
							<p className="text-center text-sm text-muted-foreground">
								¿No tienes una cuenta?{' '}
								<Link
									href="/register"
									className="font-semibold text-primary hover:text-primary/80 transition-colors">
									Crear cuenta
								</Link>
							</p>
							<Link href="/shop" className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 pt-2">
								← Volver a la tienda
							</Link>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}


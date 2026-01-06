'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,

	CardTitle,
} from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterValues } from '@/lib/validations/auth';

export default function RegisterPage() {
	const [loading, setLoading] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showVerifyModal, setShowVerifyModal] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState('');
	const { user } = useAuth();
	const router = useRouter();

	// React Hook Form
	const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
		}
	});

	useEffect(() => {
		if (user) {
			router.replace('/');
		}
	}, [user, router]);

	const onSubmit = async (data: RegisterValues) => {
		setLoading(true);
		setSubmitError(null);

		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: {
					full_name: data.name
				},
				emailRedirectTo: `${location.origin}/auth/callback`,
			}
		});

		if (error) {
			setSubmitError(error.message);
			setLoading(false);
		} else {
			setRegisteredEmail(data.email);
			setShowVerifyModal(true);
		}
	}

	const handleModalConfirm = () => {
		router.push('/login');
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
			{/* Ambient Background */}
			<div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />



			<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
				{/* Visual Side (Hidden on Mobile) */}
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
								Sabor Auténtico, Entregado Rápido
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Disfruta de las mejores hamburguesas y comidas rápidas de la ciudad. Calidad premium en cada bocado.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-8">
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
								<h3 className="font-semibold text-primary">Calidad Premium</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Ingredientes frescos y seleccionados para el mejor sabor.
								</p>
							</div>
							<div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
								<h3 className="font-semibold text-primary">Recetas Originales</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Nuestras recetas secretas te harán volver por más.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Form Side */}
				<div className="flex justify-center lg:justify-end">
					<Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
						<CardHeader className="space-y-2 pb-6">
							<div className="flex lg:hidden items-center gap-2 mb-4">
								<span className="text-xl font-bold text-primary">Foodies</span>
							</div>

							<CardTitle className="text-2xl font-bold tracking-tight">
								Crear Cuenta
							</CardTitle>
							<CardDescription className="text-base">
								Disfruta de la mejor experiencia de comida a domicilio
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
									<Label htmlFor="name" className="text-sm font-medium">
										Nombre Completo
									</Label>
									<Input
										id="name"
										type="text"
										placeholder="Juan Pérez"
										className="h-11 bg-background/50"
										disabled={loading}
										{...register("name")}
									/>
									{errors.name && (
										<p className="text-xs text-destructive font-medium">{errors.name.message}</p>
									)}
								</div>

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
									<Label htmlFor="password" className="text-sm font-medium">
										Contraseña
									</Label>
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
									{loading ? "Cargando..." : "Registrarse"}
								</Button>
							</form>
						</CardContent>

						<CardFooter className="flex flex-col space-y-4 pt-6 border-t border-border/50">
							<p className="text-center text-sm text-muted-foreground">
								¿Ya tienes una cuenta?{' '}
								<Link
									href="/login"
									className="font-semibold text-primary hover:text-primary/80 transition-colors">
									Iniciar sesión
								</Link>
							</p>
							<Link href="/shop" className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 pt-2">
								← Volver a la tienda
							</Link>
						</CardFooter>
					</Card>
				</div>
			</div>


			<Modal
				isOpen={showVerifyModal}
				onClose={handleModalConfirm}
				onConfirm={handleModalConfirm}
				title="¡Verifica tu Correo!"
				description={
					<div className="space-y-4">
						<p>Hemos enviado un enlace de confirmación a:</p>
						<div className="font-bold text-lg text-primary bg-primary/10 p-3 rounded-xl border border-primary/20 break-all shadow-inner">
							{registeredEmail}
						</div>
						<p className="text-sm">
							Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta y comenzar a disfrutar de Foodies.
						</p>
					</div>
				}
				confirmText="Ir a Iniciar Sesión"
				cancelText="Cerrar"
				variant="success"
			/>
		</div>
	);
}


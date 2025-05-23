interface PageTitleProps {
	title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
	return <h2 className="text-2xl font-bold text-black ">{title}</h2>;
}

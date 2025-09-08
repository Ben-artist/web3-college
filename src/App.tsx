import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { Toaster } from "./components/ui/toaster";
import { WalletProvider } from "./hooks/useWallet";
import AuthorPage from "./pages/AuthorPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import StudentPage from "./pages/StudentPage";

function App() {
	return (
		<WalletProvider>
			<div className="min-h-screen bg-background">
				<Header />
				<main className="container mx-auto">
					<Routes>
						<Route path="/" element={<StudentPage />} />
						<Route path="/student" element={<StudentPage />} />
						<Route path="/author" element={<AuthorPage />} />
						<Route path="/create-course" element={<CreateCoursePage />} />
						<Route path="/course/:courseId" element={<CourseDetailPage />} />
					</Routes>
				</main>
				<Toaster />
			</div>
		</WalletProvider>
	);
}

export default App;

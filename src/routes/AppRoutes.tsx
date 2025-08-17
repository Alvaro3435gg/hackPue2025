import { Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome/Welcome";
import Start from "../pages/Start/Start.tsx";
import BasicAlgebra from "../pages/Topics/BasicAlgebra";
import Geometry from "../pages/Topics/Geometry";
import MexicanIndependence from "../pages/Topics/MexicoIndependence";
import MexicanRevolution from "../pages/Topics/MexicanRevolution";
import CellsFunctions from "../pages/Topics/CellsFunctions";
import ADN from "../pages/Topics/ADN";
import QuizBasicAlgebra from "../pages/Quizzes/QuizBasicAlgebra";
import QuizGeometry from "../pages/Quizzes/QuizGeometry";
import QuizMexicanRevolution from "../pages/Quizzes/QuizMexicanRevolution";
import QuizMexicanIndependence from "../pages/Quizzes/QuizMexicanIndependence";
import QuizCellsFunctions from "../pages/Quizzes/QuizCellsFunctions";
import QuizADN from "../pages/Quizzes/QuizADN";
import Analysis from "../pages/Quizzes/Analysis";
import MathCourse from "../pages/Courses/MathCourse.tsx"
import BiologyCourse from "../pages/Courses/BiologyCourse.tsx";
import HistoryCourse from "../pages/Courses/HistoryCourse.tsx";

export default function AppRoutes() {

    return (
        <Routes>
            {/* Página inicial */}
            <Route path="/" element={<Welcome />} />
            <Route path="/start" element={<Start progress={95} />}></Route>
            <Route path="/basicalgebra" element={<BasicAlgebra />} />
            <Route path="/basicalgebra/quiz" element={<QuizBasicAlgebra />} />
            <Route path="/geometry" element={<Geometry />} />
            <Route path="/geometry/quiz" element={<QuizGeometry />} />
            <Route path="/mexicanindependence" element={<MexicanIndependence />} />
            <Route path="/mexicanindependence/quiz" element={<QuizMexicanIndependence />} />
            <Route path="/mexicanrevolution" element={<MexicanRevolution />} />
            <Route path="/mexicanrevolution/quiz" element={<QuizMexicanRevolution />} />
            <Route path="/cellsfunctions" element={<CellsFunctions />} />
            <Route path="/cellsfunctions/quiz" element={<QuizCellsFunctions />} />
            <Route path="/adn" element={<ADN />} />
            <Route path="/adn/quiz" element={<QuizADN />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/mathcourse" element={<MathCourse />} />
            <Route path="/biologycourse" element={<BiologyCourse />} />
            <Route path="/historycourse" element={ <HistoryCourse />} />
        </Routes>
    );
}

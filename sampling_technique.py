# Created by: Riley Weagant
# Date: May 2019
# Desc: Uses student grade history to sample likely grades to be assigned to a pre-defined set of current/future courses

#import dependencies
import pandas as pd
import numpy as np
from scipy.stats import truncnorm

# Define Variables
# df_cgpa: grade records in each course for queried student (Pandas Data Frame from MySQL database)
# df_student: grade records in each course and admission gpa for queried student (Pandas Data Frame from MySQL database)
# student_program: program name for queried student (String)
# df_scenario_probabilities: probability of each grade scenario for the given scenario gpa (Pandas Data Frame from CSV)
# df_course_probabilities: probability of receiving each grade in each course (Pandas Data Frame from CSV)


#calculate the student's Cumulative GPA -- Used as mu for sampling distribution
tmpArr = []
#s = df_student.iloc[-1:] #select a single row (student) from data
for x in range(len(df_cgpa)):
    s = df_cgpa.iloc[x]
    for y in range(len(s)):
        if s[y] != 0 and s[y] <= 4.3: #Check value to make sure it is not 0, and is less than or equal to 4.3
            if s[y] == -4.3: #Check if value is equal to -4.3 and replace with 0
                tmpArr.append(0) #Fits conditions, pushed to grade array
            else:
                tmpArr.append(s[y])
mu_student = np.mean(tmpArr)
mu_student_round = round(mu_student, 2)

# INPUT_DIST_PARAMS loads pre-calculated standard deviation for the whole dataset
df_dist_params = pd.read_csv(INPUT_DIST_PARAMS, low_memory = False)

std = float(df_dist_params['std'])

#set up sampling distribution (truncated normal distribution) using previously calculated std, and mu_student
dist = get_truncated_normal(mean = mu_student, sd=std, low=0, upp=4.3)

#sample 400 cumulative gpa's from distribution
cgpa_sample = []
scenario_cgpa = df_scenario_probabilities['cumulative_gpa']
unique_cgpa = scenario_cgpa.unique()
for x in range(400):
    Y = round(dist.rvs(), 2)
    for z in range(len(unique_cgpa)):
        if Y == unique_cgpa[z]: #if the random number exists in cumulative gpas
            cgpa_sample.append(Y)
            break
        elif Y < unique_cgpa[z]:  #snap random number to closest existing cumulative gpa
            Y = unique_cgpa[z]
            cgpa_sample.append(Y)
            break

#select scenarios using the probability distribution of each possible scenario
scenario_sample = []
for x in cgpa_sample:
    scenarios = df_scenario_probabilities[df_scenario_probabilities['cumulative_gpa'] == x]
    scenario_probs = scenarios['probability']
    elements = scenarios['scenario']
    rnd = np.random.choice(elements ,p=list(scenario_probs)) #returns rnd as string
    scenario = ast.literal_eval(rnd) #convert to list
    scenario_sample.append(scenario)
#for each grade scenario, assign each grade to a course
final_sample = {}
for i, s in enumerate(scenario_sample):
    course_probs = pd.DataFrame()
    for course_name in course_array:
        course_prob = df_course_probabilities.loc[df_course_probabilities['course_code'] == course_name]
        course_probs = course_probs.append(course_prob)
    course_order = {}
    for x in s: #G
        #if x not in final_grade, set probability of x to something
        tmp = course_probs[course_probs['final_grade']==x]
        elements = tmp['course_code'] #C
        probs = tmp['probability'] #P
        sum_of_probs = np.sum(probs) #S
        rnd = np.random.uniform(low=0.0,high=sum_of_probs)
        for course in range(len(elements)): #c_j
            check = rnd - probs.iloc[course]
            rnd = check
            if check <= 0:
                course_order[elements.iloc[course]] = x
                course_probs = course_probs[course_probs['course_code'] != elements.iloc[course]]
                break
    final_sample[i] = course_order

#convert final_sample dictionary to pandas dataframe and replace 0 with -4.3 (F's)
assigned_grades = pd.DataFrame.from_dict(final_sample, orient='index')
assigned_grades = assigned_grades.replace(0, -4.3)

#convert assigned_grades dataframe to python dictionary to store assigned grades/courses as a single object
#convert dict to series to append to beeswarm plot df
gpa_grade_list = [-4.3, 1.0, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 4.3]
letter_grade_list = ['F', 'D', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']
assigned_letter_grades = assigned_grades.replace(gpa_grade_list, letter_grade_list)


grades_dict = assigned_letter_grades.to_dict('records')
grades_dict_list = []
for x in grades_dict:
    grades_dict_list.append(json.dumps(x))
grades_dict_series = pd.Series(x for x in grades_dict_list)


#Update the queried row with new grades
new_df = pd.DataFrame(columns = df_student.columns)
new_df = new_df.append([df_student]*len(assigned_grades)).reset_index() #replicate row for the number of samples
new_df.update(assigned_grades)
new_df = new_df.drop(columns="index")

#append student ID to display in browser
id_array = []
program_array = []
student_cgpa_array = []
for x in range(len(assigned_grades)):
	id_array.append(student_id)
	program_array.append(student_program)
	student_cgpa_array.append(mu_student_round)

id_series = pd.Series(id_array)
program_series = pd.Series(program_array)
student_cgpa_series = pd.Series(student_cgpa_array)

# load trained predictive model
model = joblib.load(MODEL_PATH)

#predict using updated records and store confidence scores
confidence_scores = model.predict_proba(new_df)[:,1]

#fix indexing and append necessary columns
new_df = new_df.reset_index()
new_df = new_df.drop('index', axis=1)
new_df = new_df.assign(value = confidence_scores)
new_df = new_df.assign(cumulative_gpa = cgpa_sample)
new_df = new_df.assign(courses = grades_dict_series)
new_df = new_df.assign(id = id_series)
new_df = new_df.assign(program = program_series)
new_df = new_df.assign(student_cgpa = student_cgpa_series)

#select columns to send to browser
plot_df = new_df[['value','cumulative_gpa','courses', 'id', 'program', 'student_cgpa']]

#write to csv
plot_df.to_csv(CSV_PATH)

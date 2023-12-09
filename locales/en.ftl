start_command =
    .description = Start the bot
language_command =
    .description = Change language
setcommands_command =
    .description = Set bot commands

welcome = Welcome to <b>Dualboot Quiz Bot</b>!

onboarding =
    .email = To start using the bot, please, write your corporative email address.
    .email-invalid = Invalid email address. Please, try again.
    .email-exists = This email address is already in use. Please, try another one.
    .name = Enter your name as in the corporative Slack.
    .name-invalid = Invalid name. Please, try again.
    .done = Now you can use /profile to view and edit your profile. And /quiz to view available quizzes.

profile =
    .message =  <i>{$name}</i>, welcome!
    .answers = My answers
    .change-language = Change language
    .quizzes = Available quizzes

quiz =
    .list = Available quizzes:
        {$quizzes}
    .not-found = Quiz not found.
    .start = Start quiz
    .stop = Exit from quiz
     .leaderboard = Leaderboard
    .continue = Continue
    .time-limit = You need to wait {$time} seconds before answering the next question.

question =
    .new-not-found = No new questions found, yet.
    .next = <b>Answer the question:</b>
        {$question}

answer =
    .correct = Correct!
    .incorrect = Not Correct. Retry later.

language =
    .select = Please, select your language
    .changed = Language successfully changed!
    .unknown = Unknown language

admin =
    .commands-updated = Commands updated.
unhandled = Unrecognized command. Try /start
function formatUserAccess(user) {
    const roles = user.roles.map(
        ({ role }) => role.name
    );

    const permissions = [
        ...new Set(
            user.roles.flatMap(({ role }) =>
                role.permissions.map(
                    ({ permission }) => permission.name
                )
            )
        ),
    ];

    return {
        roles,
        permissions,
    };
}

export { formatUserAccess };